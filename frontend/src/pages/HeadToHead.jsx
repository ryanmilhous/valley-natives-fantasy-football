import { useState, useEffect } from 'react';
import apiService from '../services/api';

function HeadToHead() {
  const [h2hData, setH2hData] = useState({});
  const [owners, setOwners] = useState([]);
  const [selectedOwner1, setSelectedOwner1] = useState('');
  const [selectedOwner2, setSelectedOwner2] = useState('');
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [h2hResponse, ownersResponse] = await Promise.all([
          apiService.getAllHeadToHead(),
          apiService.getOwners(),
        ]);
        setH2hData(h2hResponse.data);
        // Only include owners who have H2H records (played 2019+)
        const ownersWithH2H = Object.keys(h2hResponse.data);
        const ownerList = ownersWithH2H.sort();
        setOwners(ownerList);
        if (ownerList.length >= 2) {
          setSelectedOwner1(ownerList[0]);
          setSelectedOwner2(ownerList[1]);
        }
      } catch (error) {
        console.error('Error fetching H2H data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedOwner1 && selectedOwner2) {
      // Check if both owners exist in H2H data
      if (h2hData[selectedOwner1] && h2hData[selectedOwner1][selectedOwner2]) {
        setRecord(h2hData[selectedOwner1][selectedOwner2]);
      } else {
        // No H2H data available (owners didn't play each other or played before 2019)
        setRecord({ wins: 0, losses: 0, ties: 0 });
      }
    }
  }, [selectedOwner1, selectedOwner2, h2hData]);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Head-to-Head Records</h1>

      {/* Data Availability Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Head-to-head records include both regular season and playoff matchups from 2019-present. Data before 2019 is unavailable due to ESPN API limitations.
            </p>
          </div>
        </div>
      </div>

      {/* Owner Selectors */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Owner 1</label>
            <select
              value={selectedOwner1}
              onChange={(e) => setSelectedOwner1(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {owners.map(owner => (
                <option key={owner} value={owner}>{owner}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Owner 2</label>
            <select
              value={selectedOwner2}
              onChange={(e) => setSelectedOwner2(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {owners.map(owner => (
                <option key={owner} value={owner}>{owner}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* H2H Result */}
      {record && (
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {selectedOwner1} vs {selectedOwner2}
          </h2>
          <div className="flex justify-center items-center space-x-12">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600">{record.wins}</div>
              <div className="text-sm text-gray-600 mt-2">{selectedOwner1} Wins</div>
            </div>
            <div className="text-4xl font-bold text-gray-400">-</div>
            <div className="text-center">
              <div className="text-5xl font-bold text-red-600">{record.losses}</div>
              <div className="text-sm text-gray-600 mt-2">{selectedOwner2} Wins</div>
            </div>
            {record.ties > 0 && (
              <>
                <div className="text-4xl font-bold text-gray-400">-</div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-600">{record.ties}</div>
                  <div className="text-sm text-gray-600 mt-2">Ties</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* H2H Matrix */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Complete Head-to-Head Matrix</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Owner</th>
                {owners.map(owner => (
                  <th key={owner} className="px-3 py-2 text-center text-xs font-medium text-gray-500">
                    {owner.substring(0, 10)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {owners.map(owner1 => (
                <tr key={owner1} className="hover:bg-gray-50">
                  <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                    {owner1}
                  </td>
                  {owners.map(owner2 => {
                    if (owner1 === owner2) {
                      return <td key={owner2} className="px-3 py-2 text-center text-gray-400">-</td>;
                    }
                    const rec = h2hData[owner1]?.[owner2] || { wins: 0, losses: 0 };
                    return (
                      <td key={owner2} className="px-3 py-2 text-center text-xs">
                        {rec.wins}-{rec.losses}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default HeadToHead;
