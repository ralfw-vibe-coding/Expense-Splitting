import { MemoryEventStore } from "https://raw.githubusercontent.com/ralfw/ccceventstores/main/src/mod.ts";

export async function createWriteThruEventStore(filename: string): Promise<MemoryEventStore> {
  return await MemoryEventStore.createFromFile(filename, true, true);
}
