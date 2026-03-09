import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Chart {
    id: bigint;
    dob: string;
    name: string;
    basicNumber: bigint;
    destinyNumber: bigint;
    chartNumbers: Array<bigint>;
}
export interface backendInterface {
    createChart(name: string, dob: string, basicNumber: bigint, destinyNumber: bigint, chartNumbers: Array<bigint>): Promise<bigint>;
    deleteChart(id: bigint): Promise<void>;
    getAllCharts(): Promise<Array<Chart>>;
}
