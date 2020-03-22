export type UserId = string
export type QuestId = string
export type PlayerName = string
export enum Role {
	MERLIN,
	PERCIVAL,
	LOYAL_SERVANT,
	MORGANA,
	MORDRED,
	OBERON,
	ASSASSIN,
	MINION
}
export enum Vote {
	PASS,
	FAIL
}
export enum QuestStatus {
	PROPOSING_QUEST,
	VOTING_FOR_PROPOSAL,
	PROPOSAL_REJECTED,
	VOTING_IN_QUEST,
	PASSED,
	FAILED
}
export enum GameStatus {
	NOT_STARTED,
	IN_PROGRESS,
	ASSASSINATING,
	GOOD_WON,
	EVIL_WON
}
export interface RoleInfo {
	role: Role
	isEvil: boolean
	description: string
}
export interface PlayerAndRole {
	player: PlayerName
	role: Role
}
export interface PlayerAndVote {
	player: PlayerName
	vote: Vote
}
export interface QuestAttempt {
	id: QuestId
	roundNumber: number
	attemptNumber: number
	size: number
	leader: PlayerName
	members: PlayerName[]
	votes: PlayerAndVote[]
	remainingVotes: number
	results: Vote[]
	remainingResults: number
	numFailures: number
	playerVote?: Vote
	playerResult?: Vote
	status: QuestStatus
}
export interface PlayerState {
	creator: PlayerName
	playersPerQuest: number[]
	rolesInfo: RoleInfo[]
	players: PlayerName[]
	roles: Role[]
	playerName: PlayerName
	playerRole?: Role
	knownRoles: PlayerAndRole[]
	currentQuest: QuestAttempt
	questHistory: QuestAttempt[]
	status: GameStatus
}
export interface PlayerData {
	playerName: PlayerName
}
