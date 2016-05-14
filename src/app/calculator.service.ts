import { Injectable } from '@angular/core';

import { Tile } from './tile';
import { GameService, SquareContent } from './game.service';

declare var math: any;

export interface Clearable {
  direction: number;
  offset: number;
}

@Injectable()
export class CalculatorService {

  public static DIR_HORIZONTAL = 1;
  public static DIR_VERTICAL = 2;
  public static DIR_ANTISLASH = 3;
  public static DIR_SLASH = 4;

  constructor() { }

  /**
   * returns: 
   *   null if the tile cannot be added
   *   an array elsewhere, containing information about operations to remove 
   */
  public canAddTile(grid: Array<Tile>, newOne: SquareContent): Array<Clearable> {
    // temporarly place new tile
    grid[newOne.position.index] = newOne.tile;
    let line: number = Math.floor(newOne.position.index / 5);
    let col: number = newOne.position.index % 5;
    console.log('line ' + line + ' col ' + col);
    let lineDone: string = this.checkLine(grid, line);
    let colDone: string = this.checkCol(grid, col);
    let antislashDone: string = this.checkAntislash(grid);
    let slashDone: string = this.checkSlash(grid);

    // If no operation was completed, that's ok!
    if (lineDone == null && colDone == null
      && antislashDone == null && slashDone == null) {
      // remove placed tile for tests
      grid[newOne.position.index] = null;
      return [];
    }

    let toClear: Array<Clearable> = new Array();
    if (lineDone) {
      if (!this.checkOperation(lineDone)) {
        // remove placed tile for tests
        grid[newOne.position.index] = null;
        return null;
      } else {
        toClear.push({ direction: CalculatorService.DIR_HORIZONTAL, offset: line });
      }
    }
    if (colDone) {
      if (!this.checkOperation(colDone)) {
        // remove placed tile for tests
        grid[newOne.position.index] = null;
        return null;
      } else {
        toClear.push({ direction: CalculatorService.DIR_VERTICAL, offset: col });
      }
    }
    if (antislashDone) {
      if (!this.checkOperation(antislashDone)) {
        // remove placed tile for tests
        grid[newOne.position.index] = null;
        return null;
      } else {
        toClear.push({ direction: CalculatorService.DIR_ANTISLASH, offset: 0 });
      }
    }
    if (slashDone) {
      if (!this.checkOperation(slashDone)) {
        // remove placed tile for tests
        grid[newOne.position.index] = null;
        return null;
      } else {
        toClear.push({ direction: CalculatorService.DIR_SLASH, offset: 0 });
      }
    }

    console.log('toClear: ' + JSON.stringify(toClear));
    return toClear;
  }

  /** Returns true if grid is empty and ready to go to next level */
  public gridIsEmpty(grid: Array<Tile>): boolean {
    return grid.every(el => el == null);
  }

  private checkLine(grid: Array<Tile>, line: number): string {
    return this.getFiveValues(grid, line, CalculatorService.DIR_HORIZONTAL);
  }

  private checkCol(grid: Array<Tile>, col: number): string {
    return this.getFiveValues(grid, col, CalculatorService.DIR_VERTICAL);
  }

  private checkAntislash(grid: Array<Tile>): string {
    return this.getFiveValues(grid, 0, CalculatorService.DIR_ANTISLASH);
  }

  private checkSlash(grid: Array<Tile>): string {
    return this.getFiveValues(grid, 0, CalculatorService.DIR_SLASH);
  }

  /** Return the 5 values in line, column, oblique or null if not complete */
  private getFiveValues(grid: Array<Tile>, t: number, direction: number): string {
    let ret = '';
    for (let i = 0; i < GameService.SIZE; i++) {
      let x: number, y: number;
      switch (direction) {
        case CalculatorService.DIR_HORIZONTAL: x = i; y = t; break;
        case CalculatorService.DIR_VERTICAL: x = t; y = i; break;
        case CalculatorService.DIR_ANTISLASH: x = i; y = i; break;
        case CalculatorService.DIR_SLASH: x = i; y = GameService.SIZE - 1 - i; break;
      }
      if (grid[x + GameService.SIZE * y] == null) {
        return null;
      }
      ret += grid[x + GameService.SIZE * y] ? grid[x + GameService.SIZE * y].face : '';
    }
    console.log(ret);
    return ret;
  }

  private checkOperation(str: string): boolean {
    let parts: string[] = str.split('=');
    if (parts.length != 2) {
      console.log('parts length: ' + parts.length);
      return false;
    }
    console.log('left: ' + math.eval(parts[0]));
    console.log('right: ' + math.eval(parts[1]));
    if (math.eval(parts[0]) == math.eval(parts[1])) {
      return true;
    }
    // Try reversing the operation
    str = str.split('').reverse().join('');
    parts = str.split('=');
    console.log('left: ' + math.eval(parts[0]));
    console.log('right: ' + math.eval(parts[1]));
    if (math.eval(parts[0]) == math.eval(parts[1])) {
      return true;
    }
    return false;
  }

}
