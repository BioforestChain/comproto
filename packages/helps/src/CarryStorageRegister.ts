export class CarryStorageRegister {
  static STATE_NUMBER_DIGIT_HEX = 8;
  private curCount: number = -1;
  private stateNumberArray: number[] = [];
  constructor(stateU8a?: Uint8Array) {
    if (!stateU8a) {
      return;
    }
    this.stateNumberArray = Array.prototype.slice.call(stateU8a);
  }
  public carryBitOne() {
    this.curCount++;
    const arrayPointer = Math.floor(this.curCount / CarryStorageRegister.STATE_NUMBER_DIGIT_HEX);
    const curCarryNumber = this.stateNumberArray[arrayPointer] | 0;
    this.stateNumberArray[arrayPointer] = curCarryNumber | (1 << this.curCount % CarryStorageRegister.STATE_NUMBER_DIGIT_HEX);
  }
  public carryBitZero() {
    this.curCount++;
  }
  public readBit() {
    this.curCount++;
    const arrayPointer = Math.floor(this.curCount / CarryStorageRegister.STATE_NUMBER_DIGIT_HEX);
    const curCarryNumber = this.stateNumberArray[arrayPointer] | 0;
    return (curCarryNumber >> this.curCount % CarryStorageRegister.STATE_NUMBER_DIGIT_HEX) & 1;
  }
  public getU8a() {
    return Uint8Array.from(this.stateNumberArray);
  }
  public getStateNumberArray() {
    return this.stateNumberArray;
  }
}
