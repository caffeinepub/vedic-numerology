import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface User {
    username: string;
    passwordHash: string;
    sectionLevel: bigint;
}
export interface backendInterface {
    createUser(adminUsername: string, adminPassword: string, username: string, password: string, sectionLevel: bigint): Promise<void>;
    deleteUser(adminUsername: string, adminPassword: string, username: string): Promise<void>;
    listUsers(adminUsername: string, adminPassword: string): Promise<Array<User>>;
    login(username: string, password: string): Promise<bigint>;
}
