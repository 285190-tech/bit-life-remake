# Little Life

A playful, browser-based life simulator inspired by the life-simulation genre. Start a random or custom life, make choices, build relationships, develop skills, follow a career, and watch your story unfold. The browser implementation uses name data from Life-Simulator1 and an adapted diet system from OpenLife, both MIT-licensed. See `third_party/README.md` for notices and provenance.

## How to play

- **Age up** to begin a new year. Life events depend on your age and circumstances, and eligible events are not repeated until the current pool has been exhausted. Event choices show their effects and must be resolved before continuing.
- Make up to **three activities, relationship, career, or asset decisions** per year. Viewing menus is free, and event choices don't consume a moment. Your moments reset when you age up.
- Practice music, art, and fitness from age 8. Music and fitness can unlock special careers. Work hard to build performance: 80% performance at the start of a new year earns a promotion and a 15% raise (up to level 5). Retire from a job at 65 or older to receive a pension worth 30% of your salary; taking another job replaces it.
- Friendship and partner bonds fall by 3 each year and can end if neglected. Spend time together to strengthen them. Marriage and children require a strong enough partner bond. New lives also have aging parents; visiting them raises their bond, which falls by 2 yearly. A bond below 40% halves a parent’s eventual inheritance.
- From age 19, pay 20% income tax and $12,000 in annual living costs ($8,000 with a house), plus $2,000 per child under 18 and $500 for a pet. Unpaid living costs reduce happiness; there is no debt. University takes four years and costs $5,000 up front, or $2,500 with at least 85% smarts. Choose a major to unlock related careers; prior saved graduates retain access to all degree careers. Odd jobs can help pay for school without leaving it. Funds can be invested, but their value may go down. Investments are not automatically sold to cover expenses.
- Choose a diet for annual gameplay effects and costs. Get a driver’s license before buying a car, move to a new city for a fresh start, or adopt as a single parent.
- Crime can earn money or lead to fines and prison. An arrest ends your job, studies, or pension, and convictions restrict certain careers. While in prison you can read, exercise, write to loved ones, or get medical care. Age up to serve your sentence; regular living costs are suspended for those years.
- Illness lowers health each year until treated. Medical care is covered for children under 18; adult treatment costs $500, while a regular checkup costs $100. Very low happiness also hurts health.
- Collect milestones along the way and review your life when it ends. Milestones stay unlocked for that life even if circumstances change. At the end of a life, you can continue as a child whose birth age is known. The child starts at their current age with new stats and inherits cash, investments, and possessions; their other relationships and career start fresh. The last five past lives remain readable under **Family legacy**. Choosing New life replaces the entire family archive. Older saves are preserved but don’t gain retroactive parents, and children with unknown birth ages cannot be selected.

## Saves and privacy

Progress automatically saves in the browser's local storage. No account or backend is required. Saves are local to the browser and device; clearing site data removes them. Use **Save & load** to download a JSON backup or restore one on another device. Restoring replaces the current life after confirmation. If browser storage is unavailable, the game displays a warning and a backup can still be downloaded.

## Run locally

Serve this directory with any static web server, for example:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. No build step is needed. Fonts are loaded from Google Fonts when available, with system fallbacks when offline.

## Tests

With Node.js installed, run `npm install` followed by `npm test`. The test dependency is not needed to play or deploy the game.

## Deploy to Cloudflare Pages

Connect this repository to Cloudflare Pages and use **None** as the framework preset. Leave the build command empty and set the build output directory to `/` (the repository root). Deploy. The site consists entirely of static files, so it also works with Pages Direct Upload.
