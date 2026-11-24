/**
 * The Petstore API does not assign identifiers, so the client picks one.
 * Nine random digits keep ids readable and well inside the safe integer range.
 */
export function generateId(): number {
  return 100_000_000 + Math.floor(Math.random() * 900_000_000)
}
