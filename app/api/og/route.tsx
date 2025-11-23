import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const screen = searchParams.get('screen') || 'home';
  
  if (screen === 'home') {
    const canCheckIn = searchParams.get('canCheckIn') === 'true';
    const canPlay = searchParams.get('canPlay') === 'true';
    const timeLeft = decodeURIComponent(searchParams.get('timeLeft') || '');
    const extraPlays = searchParams.get('extraPlays') || '0';
    
    return new ImageResponse(
      (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #14532d, #15803d)',
          color: 'white',
          fontFamily: 'sans-serif'
        }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>💎</div>
          <div style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 20 }}>DigBase</div>
          <div style={{ fontSize: 30, opacity: 0.9, marginBottom: 40 }}>Daily Mining Game</div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 15,
            fontSize: 24,
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: 40,
            borderRadius: 20,
            width: 500
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>✅ Check-in:</span>
              <span style={{ color: canCheckIn ? '#4ade80' : '#fbbf24' }}>
                {canCheckIn ? 'Available!' : `⏰ ${timeLeft}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>🎮 Play:</span>
              <span style={{ color: canPlay ? '#4ade80' : '#fbbf24' }}>
                {canPlay ? 'Ready!' : extraPlays === '0' ? `⏰ ${timeLeft}` : `${extraPlays} extra`}
              </span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
  
  if (screen === 'stats') {
    const totalScore = searchParams.get('totalScore') || '0';
    const gamesPlayed = searchParams.get('gamesPlayed') || '0';
    const checkIns = searchParams.get('checkIns') || '0';
    const extraPlays = searchParams.get('extraPlays') || '0';
    
    return new ImageResponse(
      (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #14532d, #15803d)',
          color: 'white'
        }}>
          <div style={{ fontSize: 70, fontWeight: 'bold', marginBottom: 40 }}>📊 Your Stats</div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 25,
            fontSize: 35,
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: 50,
            borderRadius: 20
          }}>
            <div>⭐ Total Score: <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{totalScore}</span></div>
            <div>🎮 Games Played: {gamesPlayed}</div>
            <div>✅ Check-ins: {checkIns}</div>
            {extraPlays !== '0' && <div>🎟️ Extra Plays: {extraPlays}</div>}
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
  
  if (screen === 'checkinCooldown') {
    const timeLeft = decodeURIComponent(searchParams.get('timeLeft') || '');
    
    return new ImageResponse(
      (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #14532d, #15803d)',
          color: 'white'
        }}>
          <div style={{ fontSize: 100, marginBottom: 30 }}>⏰</div>
          <div style={{ fontSize: 50, fontWeight: 'bold' }}>Already Checked In!</div>
          <div style={{ fontSize: 40, marginTop: 30, color: '#fbbf24' }}>Next in: {timeLeft}</div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
  
  if (screen === 'checkin') {
    const checkIns = searchParams.get('checkIns') || '0';
    return new ImageResponse(
      (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #14532d, #15803d)',
          color: 'white'
        }}>
          <div style={{ fontSize: 100, marginBottom: 30 }}>✅</div>
          <div style={{ fontSize: 50, fontWeight: 'bold' }}>Check-in Complete!</div>
          <div style={{ fontSize: 40, marginTop: 30 }}>Total: {checkIns} days</div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
  
  if (screen === 'game') {
    const revealed = searchParams.get('revealed')?.split(',').filter(Boolean).map(Number) || [];
    const bombs = searchParams.get('bombs')?.split(',').filter(Boolean).map(Number) || [];
    const score = searchParams.get('score') || '500';
    
    return new ImageResponse(
      (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #14532d, #15803d)',
          color: 'white',
          padding: 40
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '560px', marginBottom: 20 }}>
            <div style={{ fontSize: 35, fontWeight: 'bold' }}>💎 DigBase</div>
            <div style={{ fontSize: 35, fontWeight: 'bold', color: '#fbbf24' }}>{score}pts</div>
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(7, 1fr)', 
            gap: 8,
            width: 560,
            height: 560
          }}>
            {Array.from({ length: 49 }).map((_, i) => {
              const isRevealed = revealed.includes(i);
              const isBomb = isRevealed && bombs.includes(i);
              
              return (
                <div key={i} style={{
                  width: 75,
                  height: 75,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isRevealed ? '#1c1c1c' : '#22c55e',
                  border: '2px solid #16a34a',
                  borderRadius: 8,
                  fontSize: 40
                }}>
                  {isBomb ? '💣' : ''}
                </div>
              );
            })}
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
  
  if (screen === 'win') {
    const score = searchParams.get('score') || '0';
    const clicks = searchParams.get('clicks') || '0';
    const bombs = searchParams.get('bombs') || '0';
    
    return new ImageResponse(
      (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #064e3b, #047857)',
          color: 'white'
        }}>
          <div style={{ fontSize: 120, marginBottom: 30 }}>💎</div>
          <div style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 20 }}>Gem Found!</div>
          <div style={{ fontSize: 80, fontWeight: 'bold', color: '#fbbf24' }}>{score} Points</div>
          <div style={{ fontSize: 35, marginTop: 20, opacity: 0.9 }}>
            {clicks} digs • {bombs} bombs hit
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
  
  if (screen === 'alreadyPlayed') {
    const timeLeft = decodeURIComponent(searchParams.get('timeLeft') || '');
    
    return new ImageResponse(
      (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #14532d, #15803d)',
          color: 'white'
        }}>
          <div style={{ fontSize: 100, marginBottom: 30 }}>⏰</div>
          <div style={{ fontSize: 50, fontWeight: 'bold' }}>Already Played Today!</div>
          <div style={{ fontSize: 40, marginTop: 30, color: '#fbbf24' }}>Next game in: {timeLeft}</div>
          <div style={{ fontSize: 30, marginTop: 20, opacity: 0.8 }}>Or buy extra plays 🛍️</div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
  
  if (screen === 'shop') {
    return new ImageResponse(
      (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #14532d, #15803d)',
          color: 'white'
        }}>
          <div style={{ fontSize: 80, marginBottom: 30 }}>🛍️</div>
          <div style={{ fontSize: 50, fontWeight: 'bold', marginBottom: 40 }}>NFT Shop</div>
          <div style={{ fontSize: 35, opacity: 0.9 }}>Coming soon...</div>
          <div style={{ fontSize: 25, marginTop: 20, opacity: 0.7 }}>Buy extra plays & special perks!</div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
  
  if (screen === 'leaderboard') {
    const playersJson = searchParams.get('players');
    const players = playersJson ? JSON.parse(decodeURIComponent(playersJson)) : [];
    const userRank = searchParams.get('userRank') || '0';
    const userScore = searchParams.get('userScore') || '0';
    
    return new ImageResponse(
      (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #14532d, #15803d)',
          color: 'white',
          padding: 50
        }}>
          <div style={{ fontSize: 60, fontWeight: 'bold', marginBottom: 30 }}>🏆 Leaderboard</div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 12,
            fontSize: 22,
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: 30,
            borderRadius: 20,
            width: 700
          }}>
            {players.length === 0 ? (
              <div style={{ textAlign: 'center', opacity: 0.7, fontSize: 28 }}>No players yet...</div>
            ) : (
              players.slice(0, 10).map((player: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span>{i + 1}. FID {player.fid.slice(0, 10)}...</span>
                  <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>{player.totalScore}pts</span>
                </div>
              ))
            )}
          </div>
          {userRank !== '0' && (
            <div style={{ fontSize: 26, marginTop: 30, opacity: 0.9 }}>
              Your rank: #{userRank} ({userScore}pts)
            </div>
          )}
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
  
  if (screen === 'error') {
    return new ImageResponse(
      (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom, #7f1d1d, #991b1b)',
          color: 'white'
        }}>
          <div style={{ fontSize: 100, marginBottom: 30 }}>❌</div>
          <div style={{ fontSize: 50, fontWeight: 'bold' }}>Oops! Something went wrong</div>
          <div style={{ fontSize: 30, marginTop: 20, opacity: 0.9 }}>Please try again</div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
  
  return new ImageResponse(
    (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#15803d',
        color: 'white',
        fontSize: 60
      }}>
        DigBase 💎
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
