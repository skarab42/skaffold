export function randomShortId(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function randomProjectName(): string {
  return `my-project-${randomShortId()}`;
}
