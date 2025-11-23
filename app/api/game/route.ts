import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

interface GameState {
  fid: string;
  clicks: number;
  found: boolean;
  gemPosition: number;
  bombPositions: number[];
  revealedCells: number[];
  bombHitClicks: number[];
  score: number;
  lastPlayed: string;
}

interface UserStats {
  fid: string;
  totalScore: number;
  gamesPlayed: number;
  checkIns: number;
  lastCheckIn: string;
  extraPlaysAvailable: number;
}

function generateGame(): { gem: number; bombs: number[] } {
  const positions = new Set<number>();
  
  const gem = Math.floor(Math.random() * 49);
  positions.add(gem);
  
  const bombs: number[] = [];
  while (bombs.length < 3) {
    const bomb = Math.floor(Math.random() * 49);
    if (!positions.has(bomb)) {
      bombs.push(bomb);
      positions.add(bomb);
    }
  }
  
  return { gem, bombs };
}

function calculateScore(clicks: number, bombHitClicks: number[]): number {
  let currentScore = 500;
  currentScore -= (clicks - 1) * 10;
  
  bombHitClicks.forEach(bombClickNumber => {
    const scoreAtBombHit = 500 - (bombClickNumber - 1) * 10;
    const penalty = Math.floor(scoreAtBombHit * 0.1);
    currentScore -= penalty;
  });
  
  return Math.max(0, currentScore);
}

function canPlayToday(lastPlayed: string): boolean {
  if (!lastPlayed) return true;
  const last = new Date(lastPlayed);
  const now = new Date();
  return last.toDateString() !== now.toDateString();
}

function canCheckInToday(lastCheckIn: string): boolean {
  if (!lastCheckIn) return true;
  const last = new Date(lastCheckIn);
  const now = new Date();
  return last.toDateString() !== now.toDateString();
}

function getTimeUntilMidnight(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { untrustedData } = body;
    
    if (!untrustedData?.fid) {
      return NextResponse.json({ error: 'No FID provided' }, { status: 400 });
    }
    
    const fid = untrustedData.fid.toString();
    const buttonIndex = untrustedData.buttonIndex || 1;
    const action = untrustedData.state ? JSON.parse(untrustedData.state).action : 'home';
    
    let stats: UserStats | null = await kv.get(`stats:${fid}`);
    
    if (!stats) {
      stats = {
        fid,
        totalScore: 0,
        gamesPlayed: 0,
        checkIns: 0,
        lastCheckIn: '',
        extraPlaysAvailable: 0
      };
      await kv.set(`stats:${fid}`, stats);
    }
    
    if (action === 'home') {
      const gameState: GameState | null = await kv.get(`game:${fid}`);
      const canCheckIn = canCheckInToday(stats.lastCheckIn);
      const canPlay = canPlayToday(gameState?.lastPlayed || '');
      
      return NextResponse.json({
        image: `${process.env.NEXT_PUBLIC_URL}/api/og?screen=home&canCheckIn=${canCheckIn}&canPlay=${canPlay}&timeLeft=${encodeURIComponent(getTimeUntilMidnight())}&extraPlays=${stats.extraPlaysAvailable}`,
        buttons: [
          { label: canCheckIn ? '✅ Check In' : `⏰ ${getTimeUntilMidnight()}`, action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` },
          { label: '🎮 Play Game', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` },
          { label: '📊 Stats', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` }
        ],
        state: JSON.stringify({ action: buttonIndex === 1 ? 'checkin' : buttonIndex === 2 ? 'start' : 'stats' })
      });
    }
    
    if (action === 'stats') {
      return NextResponse.json({
        image: `${process.env.NEXT_PUBLIC_URL}/api/og?screen=stats&totalScore=${stats.totalScore}&gamesPlayed=${stats.gamesPlayed}&checkIns=${stats.checkIns}&extraPlays=${stats.extraPlaysAvailable}`,
        buttons: [
          { label: '🏠 Home', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` },
          { label: '🏆 Leaderboard', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` }
        ],
        state: JSON.stringify({ action: buttonIndex === 1 ? 'home' : 'leaderboard' })
      });
    }
    
    if (action === 'checkin') {
      if (!canCheckInToday(stats.lastCheckIn)) {
        return NextResponse.json({
          image: `${process.env.NEXT_PUBLIC_URL}/api/og?screen=checkinCooldown&timeLeft=${encodeURIComponent(getTimeUntilMidnight())}`,
          buttons: [
            { label: '🏠 Home', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` }
          ],
          state: JSON.stringify({ action: 'home' })
        });
      }
      
      stats.checkIns += 1;
      stats.lastCheckIn = new Date().toISOString();
      await kv.set(`stats:${fid}`, stats);
      
      return NextResponse.json({
        image: `${process.env.NEXT_PUBLIC_URL}/api/og?screen=checkin&checkIns=${stats.checkIns}`,
        buttons: [
          { label: '🏠 Home', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` },
          { label: '🎮 Play Game', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` }
        ],
        state: JSON.stringify({ action: buttonIndex === 1 ? 'home' : 'start' })
      });
    }
    
    if (action === 'start') {
      const gameKey = `game:${fid}`;
      let gameState: GameState | null = await kv.get(gameKey);
      
      const canPlayFree = canPlayToday(gameState?.lastPlayed || '');
      const hasExtraPlays = stats.extraPlaysAvailable > 0;
      
      if (!canPlayFree && !hasExtraPlays) {
        return NextResponse.json({
          image: `${process.env.NEXT_PUBLIC_URL}/api/og?screen=alreadyPlayed&timeLeft=${encodeURIComponent(getTimeUntilMidnight())}`,
          buttons: [
            { label: '🏠 Home', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` },
            { label: '🛍️ Buy Extra Play', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` }
          ],
          state: JSON.stringify({ action: buttonIndex === 1 ? 'home' : 'shop' })
        });
      }
      
      if (!canPlayFree && hasExtraPlays) {
        stats.extraPlaysAvailable -= 1;
        await kv.set(`stats:${fid}`, stats);
      }
      
      const { gem, bombs } = generateGame();
      gameState = {
        fid,
        clicks: 0,
        found: false,
        gemPosition: gem,
        bombPositions: bombs,
        revealedCells: [],
        bombHitClicks: [],
        score: 0,
        lastPlayed: new Date().toISOString()
      };
      
      await kv.set(gameKey, gameState);
      
      return NextResponse.json({
        image: `${process.env.NEXT_PUBLIC_URL}/api/og?screen=game&revealed=&score=500`,
        buttons: [
          { label: 'Cell 1-12', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` },
          { label: 'Cell 13-24', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` },
          { label: 'Cell 25-36', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` },
          { label: 'Cell 37-49', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` }
        ],
        state: JSON.stringify({ action: 'play' })
      });
    }
    
    if (action === 'shop') {
      return NextResponse.json({
        image: `${process.env.NEXT_PUBLIC_URL}/api/og?screen=shop`,
        buttons: [
          { label: '🏠 Home', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` }
        ],
        state: JSON.stringify({ action: 'home' })
      });
    }
    
    if (action === 'leaderboard') {
      const allKeys = await kv.keys('stats:*');
      const allStats: UserStats[] = [];
      
      for (const key of allKeys.slice(0, 100)) {
        const stat = await kv.get<UserStats>(key);
        if (stat && stat.totalScore > 0) {
          allStats.push(stat);
        }
      }
      
      const topPlayers = allStats
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 10);
      
      const userRank = allStats.findIndex(s => s.fid === fid) + 1;
      
      return NextResponse.json({
        image: `${process.env.NEXT_PUBLIC_URL}/api/og?screen=leaderboard&players=${encodeURIComponent(JSON.stringify(topPlayers))}&userRank=${userRank}&userScore=${stats.totalScore}`,
        buttons: [
          { label: '🏠 Home', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` },
          { label: '📊 My Stats', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` }
        ],
        state: JSON.stringify({ action: buttonIndex === 1 ? 'home' : 'stats' })
      });
    }
    
    if (action === 'play') {
      const gameKey = `game:${fid}`;
      const gameState: GameState | null = await kv.get(gameKey);
      
      if (!gameState) {
        return NextResponse.json({
          image: `${process.env.NEXT_PUBLIC_URL}/api/og?screen=error`,
          buttons: [
            { label: '🏠 Home', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` }
          ],
          state: JSON.stringify({ action: 'home' })
        });
      }
      
      const ranges = [[0, 12], [12, 24], [24, 36], [36, 49]];
      const [start, end] = ranges[buttonIndex - 1];
      
      let cellIndex = -1;
      for (let i = start; i < end; i++) {
        if (!gameState.revealedCells.includes(i)) {
          cellIndex = i;
          break;
        }
      }
      
      if (cellIndex === -1) {
        const currentScore = calculateScore(gameState.clicks, gameState.bombHitClicks);
        return NextResponse.json({
          image: `${process.env.NEXT_PUBLIC_URL}/api/og?screen=game&revealed=${gameState.revealedCells.join(',')}&bombs=${gameState.bombPositions.join(',')}&score=${currentScore}`,
          buttons: [
            { label: 'Cell 1-12', action: 'post' },
            { label: 'Cell 13-24', action: 'post' },
            { label: 'Cell 25-36', action: 'post' },
            { label: 'Cell 37-49', action: 'post' }
          ],
          state: JSON.stringify({ action: 'play' })
        });
      }
      
      gameState.clicks += 1;
      gameState.revealedCells.push(cellIndex);
      
      if (gameState.bombPositions.includes(cellIndex)) {
        gameState.bombHitClicks.push(gameState.clicks);
      }
      
      if (cellIndex === gameState.gemPosition) {
        gameState.score = calculateScore(gameState.clicks, gameState.bombHitClicks);
        gameState.found = true;
        
        stats.totalScore += gameState.score;
        stats.gamesPlayed += 1;
        
        await kv.set(`stats:${fid}`, stats);
        await kv.set(gameKey, gameState);
        
        return NextResponse.json({
          image: `${process.env.NEXT_PUBLIC_URL}/api/og?screen=win&score=${gameState.score}&clicks=${gameState.clicks}&bombs=${gameState.bombHitClicks.length}`,
          buttons: [
            { label: '🏠 Home', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` },
            { label: '🏆 Leaderboard', action: 'post', target: `${process.env.NEXT_PUBLIC_URL}/api/game` }
          ],
          state: JSON.stringify({ action: buttonIndex === 1 ? 'home' : 'leaderboard' })
        });
      }
      
      await kv.set(gameKey, gameState);
      
      const currentScore = calculateScore(gameState.clicks, gameState.bombHitClicks);
      
      return NextResponse.json({
        image: `${process.env.NEXT_PUBLIC_URL}/api/og?screen=game&revealed=${gameState.revealedCells.join(',')}&bombs=${gameState.bombPositions.join(',')}&score=${currentScore}`,
        buttons: [
          { label: 'Cell 1-12', action: 'post' },
          { label: 'Cell 13-24', action: 'post' },
          { label: 'Cell 25-36', action: 'post' },
          { label: 'Cell 37-49', action: 'post' }
        ],
        state: JSON.stringify({ action: 'play' })
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Game error:', error);
    return NextResponse.json({ error: 'Game error' }, { status: 500 });
  }
}
