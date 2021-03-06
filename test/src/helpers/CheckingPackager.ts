import { Arch, MacOptions, Packager, Target } from "electron-builder"
import SquirrelWindowsTarget from "electron-builder-squirrel-windows"
import { Identity } from "electron-builder/out/codeSign"
import MacPackager from "electron-builder/out/macPackager"
import { DmgTarget } from "electron-builder/out/targets/dmg"
import { AsyncTaskManager } from "electron-builder/out/util/asyncTaskManager"
import { SignOptions } from "electron-builder/out/windowsCodeSign"
import { WinPackager } from "electron-builder/out/winPackager"
import { SignOptions as MacSignOptions } from "electron-osx-sign"

export class CheckingWinPackager extends WinPackager {
  effectiveDistOptions: any
  signOptions: SignOptions | null

  constructor(info: Packager) {
    super(info)
  }

  //noinspection JSUnusedLocalSymbols
  async pack(outDir: string, arch: Arch, targets: Array<Target>, taskManager: AsyncTaskManager): Promise<any> {
    // skip pack
    const helperClass: typeof SquirrelWindowsTarget = require("electron-builder-squirrel-windows").default
    this.effectiveDistOptions = await (new helperClass(this, outDir).computeEffectiveDistOptions())

    await this.sign(this.computeAppOutDir(outDir, arch))
  }

  //noinspection JSUnusedLocalSymbols
  packageInDistributableFormat(appOutDir: string, arch: Arch, targets: Array<Target>, taskManager: AsyncTaskManager): void {
    // skip
  }

  //noinspection JSUnusedGlobalSymbols
  protected async doSign(opts: SignOptions): Promise<any> {
    this.signOptions = opts
  }
}

export class CheckingMacPackager extends MacPackager {
  effectiveDistOptions: any
  effectiveSignOptions: MacSignOptions

  constructor(info: Packager) {
    super(info)
  }

  async pack(outDir: string, arch: Arch, targets: Array<Target>, taskManager: AsyncTaskManager): Promise<any> {
    for (const target of targets) {
      // do not use instanceof to avoid dmg require
      if (target.name === "dmg") {
        this.effectiveDistOptions = await (<DmgTarget>target).computeDmgOptions()
        break
      }
    }
    // http://madole.xyz/babel-plugin-transform-async-to-module-method-gotcha/
    return await MacPackager.prototype.pack.call(this, outDir, arch, targets, taskManager)
  }

  //noinspection JSUnusedLocalSymbols
  async doPack(outDir: string, appOutDir: string, platformName: string, arch: Arch, customBuildOptions: MacOptions, targets: Array<Target>) {
    // skip
  }

  //noinspection JSUnusedGlobalSymbols
  async doSign(opts: MacSignOptions): Promise<any> {
    this.effectiveSignOptions = opts
  }

  //noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
  async doFlat(appPath: string, outFile: string, identity: Identity, keychain?: string | null): Promise<any> {
    // skip
  }

  //noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
  packageInDistributableFormat(appOutDir: string, arch: Arch, targets: Array<Target>, taskManager: AsyncTaskManager): void {
    // skip
  }

  protected async writeUpdateInfo(appOutDir: string, outDir: string) {
    // ignored
  }
}
