"use client"
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export function useStorageUrl(storageId: Id<"_storage"> | undefined) {
    return useQuery(api.storage.getUrl, storageId ? { storageId } : "skip");
  }