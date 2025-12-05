import { execFile } from 'child_process';
import * as util from 'util';
import * as fs from 'fs';

const execFileAsync = util.promisify(execFile);

export class LocalTranscriber {
  private cmd: string;

  constructor(cmd = 'whisper') {
    this.cmd = cmd; // external binary expected in PATH
  }

  /**
   * Transcribe a local audio file using an installed whisper binary.
   * This is a best-effort helper: environments vary; handle failures gracefully.
   */
  async transcribe(filePath: string): Promise<string> {
    if (!fs.existsSync(filePath)) throw new Error('file_not_found');
    try {
      // whisper <file> --model small --output_format txt --output_dir /tmp
      const outDir = require('os').tmpdir();
      const args = [filePath, '--model', 'small', '--output_format', 'txt', '--output_dir', outDir];
      const { stdout, stderr } = await execFileAsync(this.cmd, args);
      // result file usually at /tmp/<filename>.txt
      const base = require('path').basename(filePath);
      const txtPath = require('path').join(outDir, `${base}.txt`);
      if (fs.existsSync(txtPath)) {
        const txt = fs.readFileSync(txtPath, 'utf8');
        // cleanup
        try { fs.unlinkSync(txtPath); } catch {}
        return txt.trim();
      }
      // fallback to stdout
      return (stdout || stderr || '').toString().trim();
    } catch (e) {
      throw e;
    }
  }
}

export default LocalTranscriber;
