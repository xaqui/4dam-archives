#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const DEFAULT_INPUT_DIR = "db/dumps";
const DEFAULT_OUTPUT_FILE = "front/public/archive.json";
const TARGET_TABLES = new Set(["users", "posts", "post_score"]);

function parseArgs(argv) {
  const options = {
    input: DEFAULT_INPUT_DIR,
    output: DEFAULT_OUTPUT_FILE,
    pretty: false,
    strict: false,
    verbose: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--pretty") {
      options.pretty = true;
      continue;
    }

    if (arg === "--strict") {
      options.strict = true;
      continue;
    }

    if (arg === "--verbose") {
      options.verbose = true;
      continue;
    }

    if (arg === "--input" || arg === "--output") {
      const next = argv[index + 1];
      if (!next) {
        throw new Error(`Missing value for ${arg}`);
      }
      options[arg.slice(2)] = next;
      index += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Usage: build-archive.js [options]

Options:
  --input <dir>    Input dump directory (default: ${DEFAULT_INPUT_DIR})
  --output <file>  Output archive JSON (default: ${DEFAULT_OUTPUT_FILE})
  --pretty         Pretty-print output JSON
  --strict         Exit non-zero if warnings are emitted
  --verbose        Print per-file stats
  --help, -h       Show this help
`);
}

function parseDumpTimestamp(filename) {
  const match = filename.match(/-(\d{8})-(\d{4})\.sql$/);
  if (!match) {
    throw new Error(
      `Could not parse timestamp from dump filename: ${filename}`
    );
  }

  const [, yyyymmdd, hhmm] = match;
  const year = Number(yyyymmdd.slice(0, 4));
  const month = Number(yyyymmdd.slice(4, 6)) - 1;
  const day = Number(yyyymmdd.slice(6, 8));
  const hours = Number(hhmm.slice(0, 2));
  const minutes = Number(hhmm.slice(2, 4));

  return new Date(year, month, day, hours, minutes, 0, 0).getTime();
}

function discoverDumpFiles(inputDir) {
  let entries;
  try {
    entries = fs.readdirSync(inputDir, { withFileTypes: true });
  } catch (error) {
    throw new Error(`Unable to read input directory ${inputDir}: ${error.message}`);
  }

  const files = entries
    .filter((entry) => entry.isFile() && /^dump-.*\.sql$/.test(entry.name))
    .map((entry) => ({
      name: entry.name,
      fullPath: path.join(inputDir, entry.name),
      dumpTime: parseDumpTimestamp(entry.name),
    }))
    .sort((left, right) => left.dumpTime - right.dumpTime || left.name.localeCompare(right.name));

  if (files.length === 0) {
    throw new Error(`No dump files found in ${inputDir}`);
  }

  return files;
}

function createState() {
  return {
    userRevisionsByUid: new Map(),
    canonicalPostsById: new Map(),
    postScoresByKey: new Map(),
    warnings: [],
    voteRowCount: 0,
    fileStats: [],
  };
}

function addWarning(state, warning) {
  state.warnings.push(warning);
}

function extractInsertBlocks(sqlText, tableName) {
  const marker = `INSERT INTO \`${tableName}\` VALUES`;
  const blocks = [];
  let searchIndex = 0;

  while (searchIndex < sqlText.length) {
    const markerIndex = sqlText.indexOf(marker, searchIndex);
    if (markerIndex === -1) {
      break;
    }

    let cursor = markerIndex + marker.length;
    let inString = false;
    let escaping = false;

    while (cursor < sqlText.length) {
      const char = sqlText[cursor];

      if (inString) {
        if (escaping) {
          escaping = false;
        } else if (char === "\\") {
          escaping = true;
        } else if (char === "'") {
          inString = false;
        }
      } else if (char === "'") {
        inString = true;
      } else if (char === ";") {
        blocks.push(sqlText.slice(markerIndex + marker.length, cursor).trim());
        cursor += 1;
        break;
      }

      cursor += 1;
    }

    searchIndex = cursor;
  }

  return blocks;
}

function parseInsertValues(blockText) {
  const tuples = [];
  let cursor = 0;

  while (cursor < blockText.length) {
    while (cursor < blockText.length && /[\s,]/.test(blockText[cursor])) {
      cursor += 1;
    }

    if (cursor >= blockText.length) {
      break;
    }

    if (blockText[cursor] !== "(") {
      throw new Error(`Expected "(" at position ${cursor}`);
    }

    cursor += 1;
    const values = [];
    let token = "";
    let inString = false;
    let escaping = false;

    while (cursor < blockText.length) {
      const char = blockText[cursor];

      if (inString) {
        token += char;
        if (escaping) {
          escaping = false;
        } else if (char === "\\") {
          escaping = true;
        } else if (char === "'") {
          inString = false;
        }
        cursor += 1;
        continue;
      }

      if (char === "'") {
        inString = true;
        token += char;
        cursor += 1;
        continue;
      }

      if (char === ",") {
        values.push(decodeSqlValue(token.trim()));
        token = "";
        cursor += 1;
        continue;
      }

      if (char === ")") {
        values.push(decodeSqlValue(token.trim()));
        token = "";
        cursor += 1;
        break;
      }

      token += char;
      cursor += 1;
    }

    tuples.push(values);
  }

  return tuples;
}

function decodeSqlValue(token) {
  if (token === "NULL") {
    return null;
  }

  if (token === "") {
    return "";
  }

  if (token[0] === "'" && token[token.length - 1] === "'") {
    const inner = token.slice(1, -1);
    return inner.replace(/\\(.)/gs, "$1").replace(/''/g, "'");
  }

  if (/^-?\d+$/.test(token)) {
    return Number(token);
  }

  return token;
}

function normalizeEmptyString(value) {
  return value === "" ? null : value;
}

function mergeUserRow(row, dumpTime, state) {
  let [uid, displayName, avatar, _email, nick] = row;

  // Older dumps serialize users as (avatar, displayName, email, nick, uid).
  if (typeof uid === "string" && /^https?:\/\//.test(uid) && typeof row[4] === "string") {
    uid = row[4];
    avatar = row[0];
    displayName = row[1];
    nick = row[3];
  }

  if (!uid) {
    addWarning(state, `Skipping user row without uid at ${dumpTime}`);
    return;
  }

  const revision = {
    dumpTime,
    displayName: normalizeEmptyString(displayName),
    nick: normalizeEmptyString(nick),
    avatar: normalizeEmptyString(avatar),
  };

  const revisions = state.userRevisionsByUid.get(uid) || [];
  const lastRevision = revisions[revisions.length - 1];
  if (
    !lastRevision ||
    lastRevision.displayName !== revision.displayName ||
    lastRevision.nick !== revision.nick ||
    lastRevision.avatar !== revision.avatar
  ) {
    revisions.push(revision);
    state.userRevisionsByUid.set(uid, revisions);
  }
}

function mergePostRow(row, dumpTime, state) {
  let [id, date, content, mediaUrl, owner, showName] = row;

  // Older dumps serialize posts as (content, date, id, media_url, owner, password, show_name).
  if (
    typeof id === "string" &&
    !/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id) &&
    typeof content === "string" &&
    /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(content)
  ) {
    id = row[2];
    content = row[0];
    mediaUrl = row[3];
    owner = row[4];
    showName = row[6];
  }

  if (!id) {
    addWarning(state, `Skipping post row without id at ${dumpTime}`);
    return;
  }

  const normalizedRow = {
    id,
    date: Number(date) || 0,
    content: content == null ? null : content,
    media_url: normalizeEmptyString(mediaUrl),
    owner: normalizeEmptyString(owner),
    show_name: Boolean(Number(showName)),
  };

  const existing = state.canonicalPostsById.get(id);
  if (!existing) {
    state.canonicalPostsById.set(id, {
      firstSeenDumpTime: dumpTime,
      lastSeenDumpTime: dumpTime,
      row: normalizedRow,
    });
    return;
  }

  existing.lastSeenDumpTime = dumpTime;
  existing.row = normalizedRow;
}

function mergePostScoreRow(row, dumpTime, state) {
  let postId = row[0];
  let userId = row[1];
  let upvote = row[2];

  // Some older dumps serialize post_score tuples as (post_id, upvote, user_id).
  if (typeof row[1] === "number" && typeof row[2] === "string") {
    userId = row[2];
    upvote = row[1];
  }

  if (!postId || !userId) {
    addWarning(state, `Skipping post_score row without composite key at ${dumpTime}`);
    return;
  }

  const key = `${postId}:${userId}`;
  state.postScoresByKey.set(key, {
    dumpTime,
    post_id: postId,
    user_id: userId,
    upvote: Boolean(Number(upvote)),
  });
}

function resolveAuthorSnapshot(postRecord, revisions) {
  if (!postRecord.row.show_name || !postRecord.row.owner || !revisions || revisions.length === 0) {
    return null;
  }

  const byPostDate = findLatestRevisionAtOrBefore(revisions, postRecord.row.date);
  const byFirstSeen = findLatestRevisionAtOrBefore(revisions, postRecord.firstSeenDumpTime);
  const chosen = byPostDate || byFirstSeen || revisions[0];

  if (!chosen) {
    return null;
  }

  return {
    uid: postRecord.row.owner,
    displayName: chosen.displayName,
    nick: chosen.nick,
    avatar: chosen.avatar,
  };
}

function findLatestRevisionAtOrBefore(revisions, threshold) {
  let chosen = null;
  for (const revision of revisions) {
    if (revision.dumpTime <= threshold) {
      chosen = revision;
    } else {
      break;
    }
  }
  return chosen;
}

function getLatestUserSnapshot(uid, revisions) {
  if (!revisions || revisions.length === 0) {
    return null;
  }

  const latest = revisions[revisions.length - 1];
  return {
    uid,
    displayName: latest.displayName,
    nick: latest.nick,
    avatar: latest.avatar,
  };
}

function buildArchive(state, dumpFiles) {
  const pointsByPostId = new Map();
  for (const score of state.postScoresByKey.values()) {
    const delta = score.upvote ? 1 : -1;
    pointsByPostId.set(
      score.post_id,
      (pointsByPostId.get(score.post_id) || 0) + delta
    );
  }

  const posts = Array.from(state.canonicalPostsById.values())
    .map((postRecord) => {
      const revisions = state.userRevisionsByUid.get(postRecord.row.owner);
      const authorSnapshot = resolveAuthorSnapshot(postRecord, revisions);
      return {
        id: postRecord.row.id,
        date: postRecord.row.date,
        content: postRecord.row.content,
        media_url: postRecord.row.media_url,
        owner: postRecord.row.owner,
        show_name: postRecord.row.show_name,
        points: pointsByPostId.get(postRecord.row.id) || 0,
        author_snapshot: authorSnapshot,
      };
    })
    .sort((left, right) => right.date - left.date || left.id.localeCompare(right.id));

  const users = Array.from(state.userRevisionsByUid.entries())
    .map(([uid, revisions]) => getLatestUserSnapshot(uid, revisions))
    .filter(Boolean)
    .sort((left, right) => {
      const leftLabel = left.nick || left.displayName || left.uid;
      const rightLabel = right.nick || right.displayName || right.uid;
      return leftLabel.localeCompare(rightLabel) || left.uid.localeCompare(right.uid);
    });

  const archive = {
    meta: {
      generatedAt: new Date().toISOString(),
      sourceDumpCount: dumpFiles.length,
      sourceDumps: dumpFiles.map((file) => file.name),
      archivePolicy: {
        posts: "last_seen",
        votes: "final_score",
        deletedPosts: "preserved",
        authorIdentity: "historical_snapshot_best_effort",
      },
      counts: {
        posts: posts.length,
        users: users.length,
      },
    },
    users,
    posts,
  };

  return {
    archive,
    stats: {
      posts: posts.length,
      users: users.length,
      votes: state.postScoresByKey.size,
      resolvedAuthors: posts.filter((post) => post.author_snapshot !== null).length,
      warnings: state.warnings.length,
    },
  };
}

function writeArchive(outputPath, archive, pretty) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const payload = pretty
    ? `${JSON.stringify(archive, null, 2)}\n`
    : JSON.stringify(archive);
  fs.writeFileSync(outputPath, payload, "utf8");
}

function processDumpFile(file, state) {
  const sqlText = fs.readFileSync(file.fullPath, "utf8");
  const stats = {
    file: file.name,
    users: 0,
    posts: 0,
    post_score: 0,
  };

  for (const tableName of TARGET_TABLES) {
    const blocks = extractInsertBlocks(sqlText, tableName);
    for (const block of blocks) {
      let tuples;
      try {
        tuples = parseInsertValues(block);
      } catch (error) {
        addWarning(
          state,
          `Failed parsing ${tableName} rows in ${file.name}: ${error.message}`
        );
        continue;
      }

      for (const tuple of tuples) {
        try {
          if (tableName === "users") {
            mergeUserRow(tuple, file.dumpTime, state);
          } else if (tableName === "posts") {
            mergePostRow(tuple, file.dumpTime, state);
          } else if (tableName === "post_score") {
            mergePostScoreRow(tuple, file.dumpTime, state);
          }
          stats[tableName] += 1;
        } catch (error) {
          addWarning(
            state,
            `Failed merging ${tableName} row in ${file.name}: ${error.message}`
          );
        }
      }
    }
  }

  state.voteRowCount += stats.post_score;
  state.fileStats.push(stats);
}

function printSummary(summary, dumpFiles, outputPath, verbose, fileStats) {
  console.log(`Processed dump files: ${dumpFiles.length}`);
  console.log(`Unique posts exported: ${summary.posts}`);
  console.log(`Unique users with revisions: ${summary.users}`);
  console.log(`Vote rows merged: ${summary.votes}`);
  console.log(`Posts with resolved author snapshots: ${summary.resolvedAuthors}`);
  console.log(`Warnings: ${summary.warnings}`);
  console.log(`Archive written to: ${outputPath}`);

  if (!verbose) {
    return;
  }

  for (const stat of fileStats) {
    console.log(
      `- ${stat.file}: users=${stat.users}, posts=${stat.posts}, post_score=${stat.post_score}`
    );
  }
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const rootDir = path.resolve(__dirname, "..");
  const inputDir = path.resolve(rootDir, options.input);
  const outputPath = path.resolve(rootDir, options.output);

  const dumpFiles = discoverDumpFiles(inputDir);
  const state = createState();

  for (const file of dumpFiles) {
    processDumpFile(file, state);
  }

  const { archive, stats } = buildArchive(state, dumpFiles);
  writeArchive(outputPath, archive, options.pretty);
  printSummary(stats, dumpFiles, outputPath, options.verbose, state.fileStats);

  if (state.warnings.length > 0) {
    for (const warning of state.warnings) {
      console.error(`Warning: ${warning}`);
    }
  }

  if (options.strict && state.warnings.length > 0) {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
