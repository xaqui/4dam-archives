let archivePromise = null;
let archiveCache = null;

function cloneItems(items) {
  return items.map((item) => ({ ...item }));
}

function validateArchive(archive) {
  if (!archive || typeof archive !== "object") {
    throw new Error("Archive payload is missing.");
  }

  if (!archive.meta || typeof archive.meta !== "object") {
    throw new Error("Archive metadata is missing.");
  }

  if (!Array.isArray(archive.posts)) {
    throw new Error("Archive posts are missing.");
  }

  if (!Array.isArray(archive.users)) {
    throw new Error("Archive users are missing.");
  }
}

async function fetchArchive() {
  const response = await fetch("archive.json");

  if (!response.ok) {
    throw new Error(`Archive request failed with status ${response.status}.`);
  }

  const payload = await response.json();
  validateArchive(payload);
  archiveCache = payload;
  return archiveCache;
}

export async function loadArchive() {
  if (archiveCache) {
    return archiveCache;
  }

  if (!archivePromise) {
    archivePromise = fetchArchive().catch((error) => {
      archivePromise = null;
      throw error;
    });
  }

  return archivePromise;
}

export async function getArchive() {
  return loadArchive();
}

export async function getTimelinePosts() {
  const archive = await getArchive();
  return cloneItems(archive.posts).sort(
    (left, right) => right.date - left.date || left.id.localeCompare(right.id)
  );
}

export async function getBestPosts() {
  const archive = await getArchive();
  return cloneItems(archive.posts).sort(
    (left, right) =>
      right.points - left.points ||
      right.date - left.date ||
      left.id.localeCompare(right.id)
  );
}

export async function getWorstPosts() {
  const archive = await getArchive();
  return cloneItems(archive.posts).sort(
    (left, right) =>
      left.points - right.points ||
      right.date - left.date ||
      left.id.localeCompare(right.id)
  );
}

export async function getPeople() {
  const archive = await getArchive();
  return cloneItems(archive.users)
    .filter((user) => (user.displayName || "") !== "Anonymous")
    .sort((left, right) => {
      const leftLabel = left.nick || left.displayName || left.uid;
      const rightLabel = right.nick || right.displayName || right.uid;
      return leftLabel.localeCompare(rightLabel) || left.uid.localeCompare(right.uid);
    });
}
