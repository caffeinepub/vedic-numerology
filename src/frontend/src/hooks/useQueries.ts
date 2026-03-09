import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Chart } from "../backend.d.ts";
import { useActor } from "./useActor";

export type { Chart };

export function useGetAllCharts() {
  const { actor, isFetching } = useActor();
  return useQuery<Chart[]>({
    queryKey: ["charts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCharts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateChart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      name,
      dob,
      basicNumber,
      destinyNumber,
      chartNumbers,
    }: {
      name: string;
      dob: string;
      basicNumber: number;
      destinyNumber: number;
      chartNumbers: number[];
    }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createChart(
        name,
        dob,
        BigInt(basicNumber),
        BigInt(destinyNumber),
        chartNumbers.map((n) => BigInt(n)),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charts"] });
    },
  });
}

export function useDeleteChart() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteChart(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charts"] });
    },
  });
}
