import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

const ADMIN_USERNAME = "vikaskharb50@gmail.com";
const ADMIN_PASSWORD = "vikasadmin123";
const CHARTS_KEY = "vedic_saved_charts";

// ─── Chart type (localStorage-backed) ──────────────────────────────────────

export interface Chart {
  id: bigint;
  name: string;
  dob: string;
  basicNumber: bigint;
  destinyNumber: bigint;
  chartNumbers: bigint[];
}

function loadCharts(): Chart[] {
  try {
    const raw = localStorage.getItem(CHARTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<{
      id: string;
      name: string;
      dob: string;
      basicNumber: string;
      destinyNumber: string;
      chartNumbers: string[];
    }>;
    return parsed.map((c) => ({
      ...c,
      id: BigInt(c.id),
      basicNumber: BigInt(c.basicNumber),
      destinyNumber: BigInt(c.destinyNumber),
      chartNumbers: c.chartNumbers.map((n) => BigInt(n)),
    }));
  } catch {
    return [];
  }
}

function saveCharts(charts: Chart[]) {
  const serializable = charts.map((c) => ({
    ...c,
    id: c.id.toString(),
    basicNumber: c.basicNumber.toString(),
    destinyNumber: c.destinyNumber.toString(),
    chartNumbers: c.chartNumbers.map((n) => n.toString()),
  }));
  localStorage.setItem(CHARTS_KEY, JSON.stringify(serializable));
}

export function useGetAllCharts() {
  return useQuery<Chart[]>({
    queryKey: ["charts"],
    queryFn: () => loadCharts(),
  });
}

export function useCreateChart() {
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
      const charts = loadCharts();
      const newChart: Chart = {
        id: BigInt(Date.now()),
        name,
        dob,
        basicNumber: BigInt(basicNumber),
        destinyNumber: BigInt(destinyNumber),
        chartNumbers: chartNumbers.map((n) => BigInt(n)),
      };
      saveCharts([...charts, newChart]);
      return newChart;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charts"] });
    },
  });
}

export function useDeleteChart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      const charts = loadCharts().filter((c) => c.id !== id);
      saveCharts(charts);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charts"] });
    },
  });
}

// ─── Auth Hooks ──────────────────────────────────────────────────────────────

export function useLoginUser() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: { username: string; password: string }) => {
      if (!actor) throw new Error("Actor not ready");
      const level = await actor.login(username, password);
      return Number(level);
    },
  });
}

export function useListUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listUsers(ADMIN_USERNAME, ADMIN_PASSWORD);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      password,
      sectionLevel,
    }: { username: string; password: string; sectionLevel: number }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.createUser(
        ADMIN_USERNAME,
        ADMIN_PASSWORD,
        username,
        password,
        BigInt(sectionLevel),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.deleteUser(ADMIN_USERNAME, ADMIN_PASSWORD, username);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
