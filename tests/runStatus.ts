import { StatusCommand } from '../src/commands/status';

async function run() {
  const cmd = new StatusCommand();
  const ctx: any = {
    replies: [] as string[],
    reply: async (t: string) => { ctx.replies.push(t); }
  };

  await cmd.execute(ctx);
  console.log('\n=== StatusCommand replies ===\n');
  console.log(ctx.replies.join('\n\n---\n\n'));
}

run().catch(err => { console.error(err); process.exit(1); });
