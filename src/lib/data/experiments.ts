// The self-experiment drafts shown in the Voices announcement, verbatim.
//
// None of this is edited for publication. `lintkitBefore` is what the model
// wrote with no style instructions; `lintkitAfter` is its one-pass repair
// against Vale's alerts, and exits 0 under `Voices, Direct`. The DNS pair is
// the same experiment against `Simple`'s closed vocabulary: the "before" is
// the model's best unaided attempt (25 violations), the "after" is where the
// lint loop converged (0 violations under `Voices, Simple`).

export const lintkitBefore = `# Introducing LintKit 2.0

We're thrilled to announce LintKit 2.0 — a transformative update that
fundamentally reimagines how teams approach code quality.

LintKit 2.0 isn't just a linter; it's a comprehensive quality platform.
By leveraging cutting-edge AI suggestions, it empowers developers to
catch issues earlier, streamline their review process, and ship with
confidence. Whether you're a solo developer or part of a large
enterprise team, LintKit seamlessly integrates into your existing
workflow.

Key highlights include intelligent auto-fixes, deeply customizable
rulesets, and robust CI integration that plays nicely with the tools
you already use. It's worth noting that all existing configurations
remain fully compatible — upgrading is effortless.

In conclusion, LintKit 2.0 represents a pivotal moment in our journey.
We can't wait to see what you build with it. Try it today, and let us
know what you think — your feedback shapes everything we do.`;

export const lintkitAfter = `# Introducing LintKit 2.0

LintKit 2.0 is out — an update that changes how
teams approach code quality.

LintKit 2.0 is a full quality platform, not only a linter. With AI
suggestions, it helps developers catch issues earlier, simplify their
review process, and ship with confidence. Whether you're a solo
developer or part of a large enterprise team, LintKit fits into your
existing workflow.

Key highlights include intelligent auto-fixes, deeply customizable
rulesets, and strong CI integration that plays nicely with the tools
you already use. All existing configurations remain fully compatible —
upgrading is effortless.

We can't wait to see what you build with LintKit 2.0. Try it today,
and let us know what you think — your feedback shapes everything we
do.`;

export const dnsBefore = `# How your computer finds a web site

When you type a name like example.com, your computer does not know
where that site lives. It has to ask.

First it asks a helper computer whose whole job is knowing names.
If that helper does not know, it asks a bigger helper, and that one
asks an even bigger one, all the way up to the computers that keep
the master list of every name.

The answer comes back down the chain as a number. That number is the
true address of the site. Your computer keeps a copy of the answer
for a while, so the next time you go there, it does not have to ask
again.`;

export const dnsAfter = `# How your machine gets to a page kept far from you

When you put in a name, your machine does not have the knowledge of
where that page is kept. It has to put a question to a second machine.

First it goes to a machine whose one work is keeping names. If that
machine does not have the answer, it goes to a greater one, and that
one goes to a still greater one, up to the machines that keep the
complete list of every name.

The answer comes back down the line as a number. That number is the
place of the page. Your machine keeps a copy of the answer for a
time, so when you go there again, it does not have to put the
question again.`;
