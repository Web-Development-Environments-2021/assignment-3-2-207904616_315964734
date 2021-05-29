const axios = require("axios");
const { get } = require("../teams");
const { getAllTeams } = require("./team_utils");
const api_domain = "https://soccer.sportmonks.com/api/v2.0";
// const TEAM_ID = "85";
// const SEASON_ID = await axios.get(`${api_domain}/leagues/${LEAGUE_ID}`,
// {
//   params: {
//     include: "season",
//     api_token: process.env.api_token,
//   },
// }
// );

async function getPlayerIdsByTeam(team_id) {
  let player_ids_list = [];
  const team = await axios.get(`${api_domain}/teams/${team_id}`, {
    params: {
      include: "squad",
      api_token: process.env.api_token,
    },
  });
  team.data.data.squad.data.map((player) =>
    player_ids_list.push(player.player_id)
  );
  return player_ids_list;
}


async function getOnePlayerInfo(player_id){
  // name, position, teamName, image
  let playerDet = [];
  const detailsOfPlayer = await axios.get(`${api_domain}/players/${player_id}`,{
    params: {
      api_token: process.env.api_token
    },
  })

  playerName = detailsOfPlayer.data.data.fullname;
  playerPos = detailsOfPlayer.data.data.position_id;
  playerPic = detailsOfPlayer.data.data.image_path;  

  const teamId = detailsOfPlayer.data.data.team_id;
  const posId = detailsOfPlayer.data.data.position_id;

  // Get the team name
  const detTeamName = await axios.get(`${api_domain}/teams/${teamId}`,{
    params: {
      api_token: process.env.api_token
    },
  })
  playerTeamName = detTeamName.data.data.name;
  
  return {
    id: player_id,
    name: playerName,
    team: playerTeamName,
    imageUrl: playerPic,  
    position_id: posId    
  };
}


async function getPlayersInfo(players_ids_list) {
  let promises = [];
  players_ids_list.map((id) =>
    promises.push(
      axios.get(`${api_domain}/players/${id}`, {
        params: {
          api_token: process.env.api_token,
          include: "team",
        },
      })
    )
  );
  let players_info = await Promise.all(promises);
  return extractRelevantPlayerData(players_info);
}

function extractRelevantPlayerData(players_info) {
  return players_info.map((player_info) => {
    const { fullname, image_path, position_id } = player_info.data.data;
    const { name } = player_info.data.data.team.data;
    return {
      name: fullname,
      image: image_path,
      position: position_id,
      team_name: name,
    };
  });
}

async function getPlayersByTeam(team_id) {
  let player_ids_list = await getPlayerIdsByTeam(team_id);
  let players_info = await getPlayersInfo(player_ids_list);
  return players_info;
}


// Get Full data of player
async function getMoreDataOfPlayer(player_id) {
  const detailsOfPlayer = await axios.get(`${api_domain}/players/${player_id}`,{
    params: {
      api_token: process.env.api_token
    },
  })
  
  teamId = detailsOfPlayer.data.data.team_id;
  playerName = detailsOfPlayer.data.data.fullname;
  playerPos = detailsOfPlayer.data.data.position_id;
  playerPic = detailsOfPlayer.data.data.image_path;  
  commonName = detailsOfPlayer.data.data.common_name;
  nationality = detailsOfPlayer.data.data.nationality;
  birthdate = detailsOfPlayer.data.data.birthdate;
  birthcountry = detailsOfPlayer.data.birthcountry;
  height = detailsOfPlayer.data.data.height;
  weight = detailsOfPlayer.data.data.weight;

  // Get the team name
  const detTeamName = await axios.get(`${api_domain}/teams/${teamId}`,{
    params: {
      api_token: process.env.api_token
    },
  })
  playerTeamName = detTeamName.data.data.name;

  return {
    id: player_id,
    name: playerName,
    team: playerTeamName,
    imageUrl: playerPic,
    position: playerPos,
    common_name: commonName,
    nationality: nationality,
    birthdate: birthdate,
    birthcountry: birthcountry,
    height: height,
    weight: weight
  };

}

// Get names of players 
async function getDataByName(player_name){
  
  let teams = await getAllTeams();
  let teamsIds = teams.map((team) => team.id)
  let teamDic = {}
  teams.map((team) =>{teamDic[team.id] = team.name})
  // let teamsIds = Object.keys(teamDic)
  let playersToReturn = []  
  const playersWithTheNameList = await axios.get(`${api_domain}/players/search/${player_name}`,{
    params: {
      api_token: process.env.api_token
    }  
  })
  console.log(teamsIds)
 // Check inside teams
  playersWithTheNameList.data.data.map((player) => {
    
    if (teamsIds.includes(player.team_id)) {

      playersToReturn.push({        
        id: player.player_id,
        name: player.display_name,
        imageUrl: player.image_path,
        position: player.position_id,
        team_name: teamDic[player.team_id]
      })
    }

  })
  return playersToReturn;

}

exports.getPlayersByTeam = getPlayersByTeam;
exports.getPlayersInfo = getPlayersInfo;
exports.getOnePlayerInfo = getOnePlayerInfo;
exports.getMoreDataOfPlayer = getMoreDataOfPlayer;
exports.getDataByName = getDataByName;