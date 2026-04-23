import type { Product } from "./products";
import { getKV } from "./kv";

export interface Result {
  id: string;
  input: string;
  justification: string;
  product: Product;
  shareUrl: string;
  createdAt: string;
  ogImageUrl?: string; // Vercel Blob CDN URL — undefined for pre-Sprint-2 results
  /** Present when generated from homepage audience selector or gift flow (metadata + share copy). */
  audience?: "self" | "loved_one" | "we";
  /** Generation tone: deadpan institute vs warmer permission-focused copy. */
  voice?: "classic" | "warm";
  gift?: {
    recipientName: string;
    senderName?: string;
  };
  /** Whether this result is publicly visible in the ledger. Defaults to false. */
  isPublic?: boolean;
}

// ===== ENTERPRISE TEAMS =====

export interface Team {
  id: string;
  name: string;
  industry: string; // "tech", "sales", "marketing", "non-profit", "open-source", etc.
  description: string;
  createdBy: string; // user ID
  createdAt: string;
  memberCount: number;
  isPublic: boolean; // publicly visible in team gallery
  tone: "playful" | "warm"; // team's preferred tone
  logoUrl?: string;
}

export interface TeamMember {
  teamId: string;
  userId: string;
  role: "founder" | "member"; // just need founder for deletion rights
  joinedAt: string;
  displayName: string;
}

export interface TeamWin {
  id: string;
  teamId: string;
  description: string;
  category: string; // "shipped", "survived", "collaboration", "recovery", "learning"
  product?: Product;
  createdAt: string;
  createdBy: string;
  shares: number;
}

export interface Nomination {
  id: string;
  teamId: string;
  nomineeId: string;
  nominerName: string;
  reason: string;
  product?: Product;
  createdAt: string;
  approved: boolean;
}

export interface TeamChallenge {
  id: string;
  name: string;
  description: string;
  industry: string; // "all", "tech", "sales", etc.
  theme: string; // "Survived Monday", "Fixed at 3am", "Shipped Something"
  startDate: string;
  endDate: string;
  createdAt: string;
}

// ===== TEAM STORAGE FUNCTIONS =====

export async function createTeam(team: Team): Promise<void> {
  const kv = await getKV();

  if (kv) {
    await kv.set(`team:${team.id}`, JSON.stringify(team), { ex: 60 * 60 * 24 * 365 });
    await kv.lpush("teams:list", team.id);
    if (team.isPublic) {
      await kv.lpush("teams:public", team.id);
    }
    await kv.incr("teams:total");
  } else {
    memoryTeams.set(team.id, JSON.stringify(team));
    memoryTeamsList.push(team.id);
    if (team.isPublic) {
      memoryTeamsPublic.push(team.id);
    }
  }
}

export async function getTeam(teamId: string): Promise<Team | null> {
  const kv = await getKV();

  if (kv) {
    const data = await kv.get<string>(`team:${teamId}`);
    if (!data) return null;
    return JSON.parse(data);
  }

  const data = memoryTeams.get(teamId);
  if (!data) return null;
  return JSON.parse(data);
}

export async function addTeamMember(member: TeamMember): Promise<void> {
  const kv = await getKV();
  const key = `team:${member.teamId}:members:${member.userId}`;

  if (kv) {
    await kv.set(key, JSON.stringify(member), { ex: 60 * 60 * 24 * 365 });
    await kv.lpush(`team:${member.teamId}:members:list`, member.userId);

    // Update member count
    const team = await getTeam(member.teamId);
    if (team) {
      const count = await kv.llen(`team:${member.teamId}:members:list`);
      team.memberCount = count;
      await kv.set(`team:${member.teamId}`, JSON.stringify(team), { ex: 60 * 60 * 24 * 365 });
    }
  } else {
    // In-memory fallback
    memoryStore.set(key, JSON.stringify(member));
    const listKey = `team:${member.teamId}:members:list`;
    const currentList = memoryStore.get(listKey) || "[]";
    const members = JSON.parse(currentList);
    if (!members.includes(member.userId)) {
      members.push(member.userId);
      memoryStore.set(listKey, JSON.stringify(members));
    }

    // Update member count
    const team = await getTeam(member.teamId);
    if (team) {
      const memberList = JSON.parse(memoryStore.get(`team:${member.teamId}:members:list`) || "[]");
      team.memberCount = memberList.length;
      memoryTeams.set(member.teamId, JSON.stringify(team));
    }
  }
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  const kv = await getKV();
  const members: TeamMember[] = [];

  if (kv) {
    const userIds = await kv.lrange<string>(`team:${teamId}:members:list`, 0, -1);
    for (const userId of userIds) {
      const data = await kv.get<string>(`team:${teamId}:members:${userId}`);
      if (data) {
        members.push(JSON.parse(data));
      }
    }
  } else {
    // In-memory fallback
    const listData = memoryStore.get(`team:${teamId}:members:list`);
    if (!listData) return [];
    const userIds = JSON.parse(listData) as string[];
    for (const userId of userIds) {
      const data = memoryStore.get(`team:${teamId}:members:${userId}`);
      if (data) {
        members.push(JSON.parse(data));
      }
    }
  }

  return members;
}

export async function recordTeamWin(win: TeamWin): Promise<void> {
  const kv = await getKV();

  if (kv) {
    await kv.set(`team:win:${win.id}`, JSON.stringify(win), { ex: 60 * 60 * 24 * 90 });
    await kv.lpush(`team:${win.teamId}:wins`, win.id);
    await kv.zadd(`team:${win.teamId}:wins:ranked`, {
      score: new Date(win.createdAt).getTime(),
      member: win.id,
    });
  } else {
    // In-memory fallback
    memoryStore.set(`team:win:${win.id}`, JSON.stringify(win));
    const listData = memoryStore.get(`team:${win.teamId}:wins`) || "[]";
    const wins = JSON.parse(listData) as string[];
    wins.push(win.id);
    memoryStore.set(`team:${win.teamId}:wins`, JSON.stringify(wins));
  }
}

export async function getTeamWins(teamId: string, limit = 20): Promise<TeamWin[]> {
  const kv = await getKV();
  const wins: TeamWin[] = [];

  if (kv) {
    const winIds = await kv.lrange<string>(`team:${teamId}:wins`, 0, limit - 1);
    for (const winId of winIds) {
      const data = await kv.get<string>(`team:win:${winId}`);
      if (data) {
        wins.push(JSON.parse(data));
      }
    }
  } else {
    // In-memory fallback
    const listData = memoryStore.get(`team:${teamId}:wins`);
    if (!listData) return [];
    const winIds = JSON.parse(listData) as string[];
    for (const winId of winIds.slice(0, limit)) {
      const data = memoryStore.get(`team:win:${winId}`);
      if (data) {
        wins.push(JSON.parse(data));
      }
    }
  }

  return wins;
}

export async function createNomination(nomination: Nomination): Promise<void> {
  const kv = await getKV();

  if (kv) {
    await kv.set(`nomination:${nomination.id}`, JSON.stringify(nomination), { ex: 60 * 60 * 24 * 30 });
    await kv.lpush(`team:${nomination.teamId}:nominations`, nomination.id);
  } else {
    // In-memory fallback
    memoryStore.set(`nomination:${nomination.id}`, JSON.stringify(nomination));
    const listData = memoryStore.get(`team:${nomination.teamId}:nominations`) || "[]";
    const nominations = JSON.parse(listData) as string[];
    nominations.push(nomination.id);
    memoryStore.set(`team:${nomination.teamId}:nominations`, JSON.stringify(nominations));
  }
}

export async function getTeamNominations(teamId: string): Promise<Nomination[]> {
  const kv = await getKV();
  const nominations: Nomination[] = [];

  if (kv) {
    const nominationIds = await kv.lrange<string>(`team:${teamId}:nominations`, 0, -1);
    for (const nomId of nominationIds) {
      const data = await kv.get<string>(`nomination:${nomId}`);
      if (data) {
        nominations.push(JSON.parse(data));
      }
    }
  } else {
    // In-memory fallback
    const listData = memoryStore.get(`team:${teamId}:nominations`);
    if (!listData) return [];
    const nominationIds = JSON.parse(listData) as string[];
    for (const nomId of nominationIds) {
      const data = memoryStore.get(`nomination:${nomId}`);
      if (data) {
        nominations.push(JSON.parse(data));
      }
    }
  }

  return nominations;
}

export async function getPublicTeams(page = 0, perPage = 12): Promise<{ teams: Team[]; total: number }> {
  const kv = await getKV();

  if (kv) {
    const total = await kv.llen("teams:public");
    const start = page * perPage;
    const teamIds = await kv.lrange<string>("teams:public", start, start + perPage - 1);

    const teams: Team[] = [];
    for (const teamId of teamIds) {
      const team = await getTeam(teamId);
      if (team) teams.push(team);
    }

    return { teams, total };
  } else {
    // In-memory fallback
    const start = page * perPage;
    const teamIds = memoryTeamsPublic.slice(start, start + perPage);
    const teams: Team[] = [];
    for (const teamId of teamIds) {
      const team = await getTeam(teamId);
      if (team) teams.push(team);
    }
    return { teams, total: memoryTeamsPublic.length };
  }
}

// In-memory fallback — attached to global so all route modules share the same instance
const globalRef = global as typeof global & {
  __ydnStore?: Map<string, string>;
  __ydnList?: string[];
  __ydnTeams?: Map<string, string>;
  __ydnTeamsList?: string[];
  __ydnTeamsPublic?: string[];
};
if (!globalRef.__ydnStore) globalRef.__ydnStore = new Map<string, string>();
if (!globalRef.__ydnList) globalRef.__ydnList = [];
if (!globalRef.__ydnTeams) globalRef.__ydnTeams = new Map<string, string>();
if (!globalRef.__ydnTeamsList) globalRef.__ydnTeamsList = [];
if (!globalRef.__ydnTeamsPublic) globalRef.__ydnTeamsPublic = [];
const memoryStore = globalRef.__ydnStore;
const memoryList = globalRef.__ydnList;
const memoryTeams = globalRef.__ydnTeams;
const memoryTeamsList = globalRef.__ydnTeamsList;
const memoryTeamsPublic = globalRef.__ydnTeamsPublic;

export async function saveResult(result: Result): Promise<void> {
  const kv = await getKV();
  const serialized = JSON.stringify(result);

  if (kv) {
    await kv.set(`result:${result.id}`, serialized, { ex: 60 * 60 * 24 * 90 }); // 90 days
    await kv.lpush("results:list", result.id);
    await kv.ltrim("results:list", 0, 999); // Keep latest 1000
    await kv.incr("results:total");
  } else {
    memoryStore.set(result.id, serialized);
    memoryList.unshift(result.id);
    if (memoryList.length > 1000) memoryList.pop();
  }
}

export async function getResult(id: string): Promise<Result | null> {
  const kv = await getKV();

  if (kv) {
    const data = await kv.get<string>(`result:${id}`);
    if (!data) return null;
    return typeof data === "string" ? JSON.parse(data) : (data as Result);
  }

  const data = memoryStore.get(id);
  if (!data) return null;
  return JSON.parse(data);
}

export async function getRecentResults(
  page = 0,
  perPage = 12
): Promise<{ results: Result[]; total: number }> {
  const kv = await getKV();

  if (kv) {
    const total = await kv.llen("results:list");
    const start = page * perPage;
    const ids = await kv.lrange<string>("results:list", start, start + perPage - 1);

    const results: Result[] = [];
    for (const id of ids) {
      const raw = await kv.get<string>(`result:${id}`);
      if (raw) {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        results.push(parsed as Result);
      }
    }
    return { results, total };
  }

  const total = memoryList.length;
  const start = page * perPage;
  const ids = memoryList.slice(start, start + perPage);
  const results = ids
    .map((id) => {
      const raw = memoryStore.get(id);
      return raw ? (JSON.parse(raw) as Result) : null;
    })
    .filter((r): r is Result => r !== null);

  return { results, total };
}

export async function getTotalDiagnoses(): Promise<number> {
  const kv = await getKV();
  if (kv) {
    return (await kv.get<number>("results:total")) || 0;
  }
  return memoryList.length;
}

export async function getAllResultIds(): Promise<string[]> {
  const kv = await getKV();
  if (kv) {
    return kv.lrange<string>("results:list", 0, -1);
  }
  return [...memoryList];
}

// Update a result in-place without touching the list (used to patch ogImageUrl)
export async function updateResult(result: Result): Promise<void> {
  const kv = await getKV();
  const serialized = JSON.stringify(result);
  if (kv) {
    await kv.set(`result:${result.id}`, serialized, { ex: 60 * 60 * 24 * 90 });
  } else {
    memoryStore.set(result.id, serialized);
  }
}

/**
 * Store result metadata for leaderboard tracking
 * Called when result is generated
 */
export async function storeResultMetadata(
  resultId: string,
  metadata: {
    category?: string;
    isGift?: boolean;
    giftType?: string;
    voice?: string;
    createdAt: string;
  }
): Promise<void> {
  const kv = await getKV();
  if (!kv) return;

  try {
    const key = `result:${resultId}:metadata`;
    await kv.set(key, JSON.stringify(metadata), { ex: 60 * 60 * 24 * 90 });

    // Initialize metrics
    await kv.set(`result:${resultId}:likes`, "0", { ex: 60 * 60 * 24 * 90 });
    await kv.set(`result:${resultId}:shares`, "0", { ex: 60 * 60 * 24 * 90 });
    await kv.set(`result:${resultId}:affiliate_clicks`, "0", { ex: 60 * 60 * 24 * 90 });

    // Add to category-specific lists for ranking
    if (metadata.category) {
      await kv.zadd(`results:by:likes:category:${metadata.category}:zset`, {
        score: 0,
        member: resultId,
      });
      await kv.zadd(`results:by:shares:category:${metadata.category}:zset`, {
        score: 0,
        member: resultId,
      });
      await kv.zadd(`results:by:affiliate_clicks:category:${metadata.category}:zset`, {
        score: 0,
        member: resultId,
      });
    }

    // Add to global ranking lists
    await kv.zadd(`results:by:likes:zset`, { score: 0, member: resultId });
    await kv.zadd(`results:by:shares:zset`, { score: 0, member: resultId });
    await kv.zadd(`results:by:affiliate_clicks:zset`, { score: 0, member: resultId });

    // Store creation timestamp for cleanup
    await kv.zadd("results:created:zset", { score: new Date(metadata.createdAt).getTime(), member: resultId });
  } catch (error) {
    console.error("[db] Error storing result metadata:", error);
  }
}

/**
 * Get result metrics (likes, shares, affiliate clicks)
 */
export async function getResultMetrics(
  resultId: string
): Promise<{ likes: number; shares: number; affiliateClicks: number }> {
  const kv = await getKV();
  if (!kv) return { likes: 0, shares: 0, affiliateClicks: 0 };

  try {
    const [likes, shares, affiliateClicks] = await Promise.all([
      kv.get<number>(`result:${resultId}:likes`),
      kv.get<number>(`result:${resultId}:shares`),
      kv.get<number>(`result:${resultId}:affiliate_clicks`),
    ]);

    return {
      likes: likes || 0,
      shares: shares || 0,
      affiliateClicks: affiliateClicks || 0,
    };
  } catch (error) {
    console.error("[db] Error fetching metrics:", error);
    return { likes: 0, shares: 0, affiliateClicks: 0 };
  }
}

/**
 * Mark a result as public in the ledger
 */
export async function setResultPublic(resultId: string, isPublic: boolean): Promise<void> {
  const kv = await getKV();
  if (!kv) return;

  try {
    // Get the result to update it
    const result = await getResult(resultId);
    if (!result) throw new Error(`Result ${resultId} not found`);

    // Update the result object
    result.isPublic = isPublic;
    const serialized = JSON.stringify(result);

    // Save updated result
    await kv.set(`result:${resultId}`, serialized, { ex: 60 * 60 * 24 * 90 });

    // Add/remove from public ledger list
    if (isPublic) {
      // Add to public ledger (sorted by creation date, newest first)
      const timestamp = new Date(result.createdAt).getTime();
      await kv.zadd("ledger:public:zset", { score: timestamp, member: resultId });
    } else {
      // Remove from public ledger
      await kv.zrem("ledger:public:zset", resultId);
    }
  } catch (error) {
    console.error("[db] Error updating result public status:", error);
  }
}

/**
 * Get public results for the ledger (paginated)
 */
export async function getPublicLedgerResults(
  page = 0,
  perPage = 12,
  sortBy: "fresh" | "trending" = "fresh"
): Promise<{ results: Result[]; total: number }> {
  const kv = await getKV();

  if (!kv) return { results: [], total: 0 };

  try {
    let zsetKey = "ledger:public:zset";

    // If trending, use likes-based ranking
    if (sortBy === "trending") {
      // This would require a separate trending sort — for now, default to fresh
      // TODO: implement trending sort using likes + recency
    }

    // Get total count
    const total = await kv.zcard(zsetKey);

    // Get IDs in reverse order (newest first) with pagination
    const start = page * perPage;
    const ids = await kv.zrange(zsetKey, -(start + perPage), -start - 1 || -1, { rev: true }) as string[];

    // Fetch full results
    const results: Result[] = [];
    for (const id of ids) {
      const raw = await kv.get<string>(`result:${id}`);
      if (raw) {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (parsed.isPublic) {
          results.push(parsed as Result);
        }
      }
    }

    return { results, total };
  } catch (error) {
    console.error("[db] Error fetching public ledger:", error);
    return { results: [], total: 0 };
  }
}

/**
 * Get public results by category
 */
export async function getPublicLedgerByCategory(
  category: string,
  page = 0,
  perPage = 12
): Promise<{ results: Result[]; total: number }> {
  const kv = await getKV();

  if (!kv) return { results: [], total: 0 };

  try {
    const zsetKey = `ledger:public:category:${category}:zset`;

    // Get total
    const total = await kv.zcard(zsetKey);

    // Get paginated results (newest first)
    const start = page * perPage;
    const ids = await kv.zrange(zsetKey, -(start + perPage), -start - 1 || -1, { rev: true }) as string[];

    // Fetch full results
    const results: Result[] = [];
    for (const id of ids) {
      const raw = await kv.get<string>(`result:${id}`);
      if (raw) {
        const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (parsed.isPublic) {
          results.push(parsed as Result);
        }
      }
    }

    return { results, total };
  } catch (error) {
    console.error("[db] Error fetching public ledger by category:", error);
    return { results: [], total: 0 };
  }
}
