import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChampionshipTrophy from '../components/ChampionshipTrophy';
import ToiletBowlTrophy from '../components/ToiletBowlTrophy';

// Custom tooltip component for achievement badges
const AchievementBadge = ({ emoji, count, years, bgColor, textColor, borderColor }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (count === 0) {
    return <span className="text-white/30">-</span>;
  }

  return (
    <div className="relative inline-block">
      <span
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full ${bgColor} ${textColor} font-bold border ${borderColor} hover:opacity-80 transition-all cursor-pointer`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span>{emoji}</span>
        <span>{count}</span>
      </span>
      {showTooltip && years.length > 0 && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg shadow-lg border border-white/20 whitespace-nowrap">
          Years: {years.join(', ')}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-slate-800"></div>
          </div>
        </div>
      )}
    </div>
  );
};

function Home() {
  const [metadata, setMetadata] = useState(null);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'rankingPoints', direction: 'desc' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metaResponse, ownersResponse] = await Promise.all([
          apiService.getMetadata(),
          apiService.getOwners(),
        ]);
        setMetadata(metaResponse.data);
        setOwners(ownersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="text-white/70 mt-4 font-medium">Loading your league data...</p>
        </div>
      </div>
    );
  }

  // Prepare championship trophy data (sorted by year)
  const championshipTrophyData = [];
  owners.forEach(owner => {
    const years = owner.all_time.championship_years || [];
    years.forEach(year => {
      const season = owner.seasons.find(s => s.year === year);
      championshipTrophyData.push({
        year,
        owner: owner.owner,
        team_name: season?.team_name || 'Unknown'
      });
    });
  });
  championshipTrophyData.sort((a, b) => a.year - b.year);

  // Prepare toilet bowl trophy data (sorted by year)
  const toiletBowlTrophyData = [];
  owners.forEach(owner => {
    const years = owner.all_time.toilet_bowl_years || [];
    years.forEach(year => {
      const season = owner.seasons.find(s => s.year === year);
      toiletBowlTrophyData.push({
        year,
        owner: owner.owner,
        team_name: season?.team_name || 'Unknown'
      });
    });
  });
  toiletBowlTrophyData.sort((a, b) => a.year - b.year);

  // Championship chart data (sorted by ranking points)
  const championshipData = owners
    .map(owner => ({
      owner: owner.owner,
      championships: owner.all_time.championships,
      years: owner.all_time.championship_years || [],
      rankingPoints: owner.all_time.ranking_points || 0
    }))
    .filter(o => o.championships > 0)
    .sort((a, b) => b.rankingPoints - a.rankingPoints);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedOwners = () => {
    const sorted = [...owners].sort((a, b) => {
      let aValue, bValue;

      switch (sortConfig.key) {
        case 'owner':
          aValue = a.owner;
          bValue = b.owner;
          break;
        case 'seasons':
          aValue = a.seasons_played;
          bValue = b.seasons_played;
          break;
        case 'wins':
          aValue = a.all_time.wins;
          bValue = b.all_time.wins;
          break;
        case 'losses':
          aValue = a.all_time.losses;
          bValue = b.all_time.losses;
          break;
        case 'winPct':
          aValue = a.all_time.win_percentage;
          bValue = b.all_time.win_percentage;
          break;
        case 'championships':
          aValue = a.all_time.championships;
          bValue = b.all_time.championships;
          // Secondary sort by win percentage
          if (aValue === bValue) {
            return sortConfig.direction === 'desc'
              ? b.all_time.win_percentage - a.all_time.win_percentage
              : a.all_time.win_percentage - b.all_time.win_percentage;
          }
          break;
        case 'secondPlace':
          aValue = a.all_time.second_place;
          bValue = b.all_time.second_place;
          break;
        case 'thirdPlace':
          aValue = a.all_time.third_place;
          bValue = b.all_time.third_place;
          break;
        case 'playoffAppearances':
          aValue = a.all_time.playoff_appearances || 0;
          bValue = b.all_time.playoff_appearances || 0;
          break;
        case 'toiletBowl':
          aValue = a.all_time.toilet_bowl;
          bValue = b.all_time.toilet_bowl;
          break;
        case 'rankingPoints':
          aValue = a.all_time.ranking_points || 0;
          bValue = b.all_time.ranking_points || 0;
          // Secondary sort by championships
          if (aValue === bValue) {
            return sortConfig.direction === 'desc'
              ? b.all_time.championships - a.all_time.championships
              : a.all_time.championships - b.all_time.championships;
          }
          break;
        case 'toiletBowlPct':
          aValue = a.all_time.toilet_bowl_pct || 0;
          bValue = b.all_time.toilet_bowl_pct || 0;
          break;
        case 'top3Pct':
          aValue = a.all_time.top_3_pct || 0;
          bValue = b.all_time.top_3_pct || 0;
          break;
        case 'playoffAppearancePct':
          aValue = a.all_time.playoff_appearance_pct || 0;
          bValue = b.all_time.playoff_appearance_pct || 0;
          break;
        default:
          aValue = a.all_time.ranking_points || 0;
          bValue = b.all_time.ranking_points || 0;
      }

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return sorted;
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) {
      return <span className="text-white/30 ml-1">⇅</span>;
    }
    return sortConfig.direction === 'asc' ?
      <span className="text-purple-400 ml-1">↑</span> :
      <span className="text-purple-400 ml-1">↓</span>;
  };


  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row items-center sm:space-x-4 mb-6 text-center sm:text-left">
            <div className="text-4xl sm:text-6xl animate-bounce mb-4 sm:mb-0">🏆</div>
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {metadata?.league_name || 'Fantasy Football League'}
              </h1>
              <p className="text-base sm:text-xl text-white/70 mt-2">
                {metadata?.total_seasons} seasons • {metadata?.total_owners} owners • {metadata?.total_teams} teams
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 group-hover:from-blue-500/10 group-hover:to-blue-500/20 transition-all duration-300"></div>
              <div className="relative">
                <div className="text-4xl font-bold text-blue-400">{metadata?.total_seasons}</div>
                <div className="text-sm text-blue-300/70 mt-1 font-medium">Seasons Played</div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 p-6 border border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/10 group-hover:from-green-500/10 group-hover:to-green-500/20 transition-all duration-300"></div>
              <div className="relative">
                <div className="text-4xl font-bold text-green-400">{metadata?.total_teams}</div>
                <div className="text-sm text-green-300/70 mt-1 font-medium">Active Teams</div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/10 group-hover:from-purple-500/10 group-hover:to-purple-500/20 transition-all duration-300"></div>
              <div className="relative">
                <div className="text-4xl font-bold text-purple-400">{metadata?.total_owners}</div>
                <div className="text-sm text-purple-300/70 mt-1 font-medium">Total Owners</div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-6 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/10 group-hover:from-orange-500/10 group-hover:to-orange-500/20 transition-all duration-300"></div>
              <div className="relative">
                <div className="text-3xl font-bold text-orange-400">
                  {metadata?.first_season}-{metadata?.latest_season}
                </div>
                <div className="text-sm text-orange-300/70 mt-1 font-medium">Year Range</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trophy Case */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-200 via-amber-100 to-orange-200 p-1 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/40 via-amber-100/40 to-orange-100/40 animate-pulse opacity-60"></div>
        <div className="relative bg-gradient-to-br from-yellow-100 via-yellow-50 to-orange-100 rounded-3xl p-8 border-2 border-yellow-300/60 shadow-inner">
          {/* Animated Firework Elements */}
          <div className="absolute top-10 left-10 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-32 left-1/4 w-2 h-2 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-24 right-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-amber-300 rounded-full animate-ping" style={{ animationDelay: '0.8s' }}></div>
          <div className="absolute top-1/3 right-10 w-2 h-2 bg-orange-300 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute top-1/2 left-16 w-3 h-3 bg-yellow-300 rounded-full animate-ping" style={{ animationDelay: '1.2s' }}></div>
          <div className="absolute bottom-1/3 right-16 w-2 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }}></div>

          {/* Larger glow effects */}
          <div className="absolute top-4 left-4 w-20 h-20 bg-yellow-300/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-4 right-4 w-32 h-32 bg-orange-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-300/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

          <h2 className="relative text-5xl font-bold mb-8 text-center flex items-center justify-center space-x-3 drop-shadow-lg">
            <span className="text-6xl drop-shadow-lg animate-pulse">🏆</span>
            <span className="bg-gradient-to-r from-yellow-500 via-amber-400 to-orange-500 bg-clip-text text-transparent" style={{ backgroundSize: '200% auto', animation: 'gradient 3s ease infinite' }}>Trophy Case</span>
          </h2>
          <style jsx>{`
            @keyframes gradient {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
          `}</style>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Championship Trophy */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-center flex items-center justify-center space-x-2">
                <span className="text-3xl">🏆</span>
                <span className="bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent">Championship</span>
              </h3>
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-2xl">
                  <img
                    src="/images/championship-trophy.png"
                    alt="Championship Trophy"
                    className="w-full h-auto mt-8"
                    style={{ mixBlendMode: 'multiply', opacity: 0.95 }}
                  />
                  <div className="absolute bottom-[27%] left-[18%] right-[18%] max-h-[30%]">
                    <div
                      className="grid grid-cols-3 gap-x-6 gap-y-0 p-4 auto-rows-min"
                      style={{ gridAutoFlow: 'column', gridTemplateRows: `repeat(${Math.ceil(championshipTrophyData.length / 3)}, minmax(0, 1fr))` }}
                    >
                      {championshipTrophyData.map((champ, index) => (
                        <div key={index} className="text-left">
                          <span className="text-amber-200 font-bold text-[8px] drop-shadow-lg whitespace-nowrap" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                            {champ.year} - {champ.owner}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Toilet Bowl Trophy */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-center flex items-center justify-center space-x-2">
                <span className="text-3xl">💩</span>
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">Toilet Bowl</span>
              </h3>
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-2xl">
                  <img
                    src="/images/toilet-bowl-trophy.png"
                    alt="Toilet Bowl Trophy"
                    className="w-full h-auto"
                    style={{ mixBlendMode: 'multiply', opacity: 0.95 }}
                  />
                  <div className="absolute bottom-[24%] left-[18%] right-[18%] max-h-[30%]">
                    <div
                      className="grid grid-cols-3 gap-x-6 gap-y-0 p-4 auto-rows-min"
                      style={{ gridAutoFlow: 'column', gridTemplateRows: `repeat(${Math.ceil(toiletBowlTrophyData.length / 3)}, minmax(0, 1fr))` }}
                    >
                      {toiletBowlTrophyData.map((bowl, index) => (
                        <div key={index} className="text-left">
                          <span className="text-amber-200 font-bold text-[8px] drop-shadow-lg whitespace-nowrap" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.8)'}}>
                            {bowl.year} - {bowl.owner}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All-Time Standings */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10">
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 flex items-center space-x-2 sm:space-x-3">
            <span>📊</span>
            <span>All-Time Standings</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/50 mb-4 sm:mb-6">Regular season records only (playoffs excluded)</p>
          <div className="overflow-x-auto rounded-xl -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase">#</th>
                  <th
                    onClick={() => handleSort('owner')}
                    className="px-2 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    Owner<SortIcon column="owner" />
                  </th>
                  <th
                    onClick={() => handleSort('seasons')}
                    className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    Seas<SortIcon column="seasons" />
                  </th>
                  <th
                    onClick={() => handleSort('wins')}
                    className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    W<SortIcon column="wins" />
                  </th>
                  <th
                    onClick={() => handleSort('losses')}
                    className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    L<SortIcon column="losses" />
                  </th>
                  <th
                    onClick={() => handleSort('winPct')}
                    className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    W%<SortIcon column="winPct" />
                  </th>
                  <th
                    onClick={() => handleSort('championships')}
                    className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    1st<SortIcon column="championships" />
                  </th>
                  <th
                    onClick={() => handleSort('secondPlace')}
                    className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    2nd<SortIcon column="secondPlace" />
                  </th>
                  <th
                    onClick={() => handleSort('thirdPlace')}
                    className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    3rd<SortIcon column="thirdPlace" />
                  </th>
                  <th
                    onClick={() => handleSort('playoffAppearances')}
                    className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    PO<SortIcon column="playoffAppearances" />
                  </th>
                  <th
                    onClick={() => handleSort('toiletBowl')}
                    className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    🚽<SortIcon column="toiletBowl" />
                  </th>
                  <th
                    onClick={() => handleSort('toiletBowlPct')}
                    className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    🚽%<SortIcon column="toiletBowlPct" />
                  </th>
                  <th
                    onClick={() => handleSort('top3Pct')}
                    className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    T3%<SortIcon column="top3Pct" />
                  </th>
                  <th
                    onClick={() => handleSort('playoffAppearancePct')}
                    className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    PO%<SortIcon column="playoffAppearancePct" />
                  </th>
                  <th
                    onClick={() => handleSort('rankingPoints')}
                    className="px-1 py-3 text-left text-xs font-bold text-purple-400 uppercase cursor-pointer hover:text-purple-300 transition-colors"
                  >
                    Pts<SortIcon column="rankingPoints" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {getSortedOwners().map((owner, index) => {
                    const winPct = owner.all_time.win_percentage;
                    const yearRange = owner.first_season === owner.last_season
                      ? owner.first_season
                      : `${owner.first_season}-${owner.last_season}`;

                    // Get years for each finish type from precomputed arrays
                    const firstPlaceYears = owner.all_time.championship_years || [];
                    const secondPlaceYears = owner.all_time.second_place_years || [];
                    const thirdPlaceYears = owner.all_time.third_place_years || [];
                    const toiletBowlYears = owner.all_time.toilet_bowl_years || [];

                    return (
                      <tr key={owner.owner} className="hover:bg-white/5 transition-colors duration-200 group">
                        <td className="px-1 py-3 whitespace-nowrap">
                          <span className={`text-sm font-bold ${
                            index === 0 ? 'text-yellow-400' :
                            index === 1 ? 'text-gray-300' :
                            index === 2 ? 'text-orange-400' :
                            'text-white/70'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-2 py-3 whitespace-nowrap">
                          <div className="text-white font-semibold text-sm">{owner.owner}</div>
                          <div className="text-xs text-white/50">{yearRange}</div>
                        </td>
                        <td className="px-1 py-3 whitespace-nowrap text-purple-400 font-semibold">
                          {owner.seasons_played}
                        </td>
                        <td className="px-1 py-3 whitespace-nowrap text-green-400 font-semibold">
                          {owner.all_time.wins}
                        </td>
                        <td className="px-1 py-3 whitespace-nowrap text-red-400 font-semibold">
                          {owner.all_time.losses}
                        </td>
                        <td className="px-1 py-3 whitespace-nowrap text-blue-400 font-semibold">
                          {winPct}%
                        </td>
                        <td className="px-1 py-3 whitespace-nowrap">
                          <AchievementBadge
                            emoji="🏆"
                            count={owner.all_time.championships}
                            years={firstPlaceYears}
                            bgColor="bg-yellow-500/20"
                            textColor="text-yellow-400"
                            borderColor="border-yellow-500/30"
                          />
                        </td>
                        <td className="px-1 py-3 whitespace-nowrap">
                          <AchievementBadge
                            emoji="🥈"
                            count={owner.all_time.second_place}
                            years={secondPlaceYears}
                            bgColor="bg-gray-400/20"
                            textColor="text-gray-300"
                            borderColor="border-gray-400/30"
                          />
                        </td>
                        <td className="px-1 py-3 whitespace-nowrap">
                          <AchievementBadge
                            emoji="🥉"
                            count={owner.all_time.third_place}
                            years={thirdPlaceYears}
                            bgColor="bg-orange-600/20"
                            textColor="text-orange-400"
                            borderColor="border-orange-600/30"
                          />
                        </td>
                        <td className="px-1 py-3 whitespace-nowrap text-blue-400 font-semibold text-sm">
                          {owner.all_time.playoff_appearances || 0}
                        </td>
                        <td className="px-1 py-3 whitespace-nowrap">
                          <AchievementBadge
                            emoji="🚽"
                            count={owner.all_time.toilet_bowl}
                            years={toiletBowlYears}
                            bgColor="bg-brown-600/20"
                            textColor="text-white"
                            borderColor="border-brown-600/30"
                          />
                        </td>
                        <td className="px-1 py-3 whitespace-nowrap text-red-400 font-semibold text-sm">
                          {owner.all_time.toilet_bowl_pct || 0}%
                        </td>
                        <td className="px-1 py-3 whitespace-nowrap text-green-400 font-semibold text-sm">
                          {owner.all_time.top_3_pct || 0}%
                        </td>
                        <td className="px-1 py-3 whitespace-nowrap text-cyan-400 font-semibold text-sm">
                          {owner.all_time.playoff_appearance_pct || 0}%
                        </td>
                        <td className="px-1 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 text-xs">
                            {owner.all_time.ranking_points || 0}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Ranking Methodology */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 p-1">
        <div className="bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <div className="flex items-start space-x-3">
            <div className="text-3xl">📊</div>
            <div>
              <h3 className="text-xl font-bold text-purple-400 mb-2">Ranking System</h3>
              <p className="text-white/70 text-sm sm:text-base">
                Owners are ranked using a point system: <span className="text-yellow-400 font-semibold">+7 points</span> for 1st place,
                <span className="text-gray-300 font-semibold"> +3 points</span> for 2nd place,
                <span className="text-orange-400 font-semibold"> +1 point</span> for 3rd place, and
                <span className="text-red-400 font-semibold"> -1 point</span> for toilet bowl finishes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
