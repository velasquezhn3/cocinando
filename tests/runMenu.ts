import { MenuCommand } from '../src/commands/menu';

async function run() {
  const cmd = new MenuCommand();
  const ctx: any = {
    replies: [] as string[],
    reply: async (t: string) => { ctx.replies.push(t); }
  };

  await cmd.execute(ctx);
  console.log('\n=== MenuCommand replies ===\n');
  console.log(ctx.replies.join('\n\n---\n\n'));
}

run().catch(err => { console.error(err); process.exit(1); });
