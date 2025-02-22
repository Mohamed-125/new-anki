const QueryKeys = {
  getMe: () => ["user"],
  getUser: (id: string) => ["user", id],
  getCards: () => ["cards"],
  getSearchCards: (query: string) => ["cards", query],
  getCollections: () => ["collections"],
  getCollection: (id: string) => ["collection", id],
  getTexts: () => ["texts"],
  getText: (id: string) => ["text", id],
  getVideos: () => ["videos"],
  getVideo: (id: string) => ["video", id],
  getPlaylists: () => ["playlists"],
  getPlaylist: (id: string) => ["playlist", id],
  getNotes: () => ["notes"],
  getNote: (id: string) => ["note", id],
};

export default QueryKeys;
