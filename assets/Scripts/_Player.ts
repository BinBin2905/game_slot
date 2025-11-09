export class _PLayer {
  private playerName: string;
  private playerBalance: number;
  private playerBet: number;

  constructor(name: string, balance: number, bet: number = 10) {
    this.playerName = name;
    this.playerBalance = balance;
    this.playerBet = bet;
  }
  getName(): string {
    return this.playerName;
  }
  getBalance(): number {
    return this.playerBalance;
  }

  getBet(): number {
    return this.playerBet;
  }

  updateBalance(amount: number): void {
    this.playerBalance += amount;
  }

  setBet(amount: number): void {
    this.playerBet += amount;
  }

  setName(name: string): void {
    this.playerName = name;
  }
  setBalance(balance: number): void {
    this.playerBalance = balance;
  }
}
