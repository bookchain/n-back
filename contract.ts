import {
  NearBindgen,
  near,
  call,
  view,
  Vector,
  NearPromise,
} from "near-sdk-js";
import { POINT_ONE, PostedMessage } from "./model";
import { Near, utils } from "near-api-js";

@NearBindgen({})
class GuestBook {
  messages: Vector<PostedMessage> = new Vector<PostedMessage>("v-uid");

  @call({ payableFunction: true })
  // Public - Adds a new message.
  add_message({
    deadline,
    points,
    parties,
    level,
  }: {
    deadline: number;
    points: number;
    parties: number;
    level: number;
  }) {
    const sender = near.predecessorAccountId();
    const bet: bigint = near.attachedDeposit() as bigint;
    let proverka = true;
    this.messages.toArray().forEach((item) => {
      if (item.sender == sender && item.status == "active") proverka = false;
          const promise = near.promiseBatchCreate(sender);
          near.promiseBatchActionTransfer(promise, bet);
      // вернуть деньги
    });
    if (proverka) {
      const start: boolean = false;
      const status: string = "active";
      this.messages.push({
        sender,
        bet,
        deadline,
        points,
        parties,
        level,
        start,
        status,
      });
    }
  }

  @view({})
  getUser(user) {
    let userBets = [];
    if (this.messages.length) {
      this.messages.toArray().forEach((item, index) => {
        if (item.sender == user.user) {
          userBets.push(item);
        }
      });
    }
    return userBets;
  }

  @call({})
  checkTime(){
    const sender = near.predecessorAccountId()
    this.messages.toArray().forEach((itemUser, index) => {
      if(itemUser.sender == sender && BigInt(itemUser.deadline * 1000000) < near.blockTimestamp() && itemUser.points > 0 && itemUser.status == 'active'){
        const promise = near.promiseBatchCreate("bookjack.testnet");
        near.promiseBatchActionTransfer(promise, itemUser.bet);
        itemUser.status = "time is up";
        this.messages.replace(index, itemUser);

        // переслать мне деньги
      }
    })
  }




  @call({})
  startPartie({ level }: { level: number }) {
    const sender = near.predecessorAccountId();
    this.messages.toArray().forEach((itemUser, index) => {
      if (itemUser.sender == sender && itemUser.status == "active") {
        if (
          BigInt(itemUser.deadline * 1000000) > near.blockTimestamp() &&
          itemUser.parties > 0 &&
          itemUser.level === level &&
          itemUser.points > 0
        ) {
          itemUser.start = true;
          itemUser.parties -= 1;
          this.messages.replace(index, itemUser);
        } else {
          itemUser.start = false;
          this.messages.replace(index, itemUser);
        }
      }
    });
  }

  @call({})
  stopPartie({ points }: { points: number }) {
    const sender = near.predecessorAccountId();
    this.messages.toArray().forEach((itemUser, index) => {
      if (itemUser.sender == sender && itemUser.status == "active") {
        if (itemUser.start) {
          itemUser.points -= points;
          itemUser.start = false;
          if (itemUser.points <= 0) {
            itemUser.status = "win";
            // отправить деньги ему
            const promise = near.promiseBatchCreate(sender);
            near.promiseBatchActionTransfer(promise, itemUser.bet);
          }
          if (itemUser.parties <= 0 && itemUser.points > 0) {
            itemUser.status = "parties are over";
            // отправить деньги мне
            const promise = near.promiseBatchCreate("bookjack.testnet");
            near.promiseBatchActionTransfer(promise, itemUser.bet);
          }

          this.messages.replace(index, itemUser);
        }
      }
    });
  }

  @call({})
  getAll() {
    return this.messages.toArray();
  }

  @view({})
  getTime() {
    return near.blockTimestamp();
  }

  @call({})
  clearState() {
    this.messages.clear();
  }
}
