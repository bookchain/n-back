export const POINT_ONE = "100000000000000000000000";

export class PostedMessage {
  sender: string;
  bet: bigint;
  deadline: number;
  points: number;
  parties: number;
  level: number;
  start: boolean;
  status: string
  constructor({
    sender,
    bet,
    deadline,
    parties,
    points,
    level,
    start,
    status
  }: PostedMessage) {
    this.sender = sender;
    this.bet = bet;
    this.deadline = deadline;
    this.points = points;
    this.parties = parties;
    this.level = level;
    this.start = start;
    this.status = status;

  }
}
