
declare module "pf-boggle" {
  export function generate(size: number) : any;
  export function solve(board: string[]) : any;
  export function points(word: string, size? : number): number;
}
