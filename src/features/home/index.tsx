import {Button, H2, H3, H6, Input, Paragraph, ScrollView, XStack, YStack} from "tamagui";
import React, {useEffect, useState} from "react";
import {ArrowLeft, Check, Plus, Trash, Undo, UserPlus, X} from "@tamagui/lucide-icons";

interface Team {
  name: string;
  color: "pink" | "blue" | "green" | "red" | "orange" | "purple" | "yellow";
  players: {
    name: string;
    avatar?: string;
  }[];
}

export function PlayScreen({teams, goBack, target}: { teams: Team[]; goBack(): void; target: number }) {
  const [rounds, setRounds] = useState<([number, number] | null)[][]>([
    teams.map(() => null)
  ]);

  function undo() {
    const newRounds: ([number, number] | null)[][] = JSON.parse(JSON.stringify(rounds));

    let currentRound = newRounds[newRounds.length - 1];

    if (currentRound.every(i => i === null)) {
      newRounds.pop();
    }

    currentRound = newRounds[newRounds.length - 1]

    const currentTeamIndex = currentRound.findLastIndex(i => i !== null);

    currentRound[currentTeamIndex] = null;

    setRounds(newRounds);
  }

  function enterScore(points: number) {
    const newRounds: ([number, number] | null)[][] = JSON.parse(JSON.stringify(rounds));

    const currentRound = newRounds[newRounds.length - 1];
    const prevRound = newRounds[newRounds.length - 2];
    const currentTeamIndex = currentRound.findIndex(i => i === null);

    currentRound[currentTeamIndex] = [(prevRound?.[currentTeamIndex]?.[0] ?? 0) + points, points];

    const currentTeamRound = currentRound[currentTeamIndex]!;

    if (currentTeamRound[0] > target) {
      currentTeamRound[0] = target / 2;
    } else if (newRounds.slice(-3).filter(round => round[currentTeamIndex]?.[1] === 0).length === 3) {
      currentTeamRound[0] = currentTeamRound[0] >= (target / 2) ? (target / 2) : 0;
    }

    if (currentRound.every(i => i !== null)) {
      newRounds.push(teams.map(() => null));
    }

    setRounds(newRounds);

  }

  const currentTeamIndex = rounds[rounds.length - 1]?.findIndex(i => i === null);
  const currentTeam = teams[currentTeamIndex];

  const teamWon = teams.find((_, teamIndex) => rounds.findLast(i => i[teamIndex])?.[teamIndex]?.[0] === target);

  return (
      <YStack flex={1} p="$2" gap="$2">
        <XStack ai="center">
          <Button chromeless icon={ArrowLeft} onPress={() => {
            if (confirm("Are you sure you want to exit play? All progress will be lost.")) {
              goBack();
            }
          }}/>
          <H3>Round {rounds.length}</H3>
        </XStack>
        {!!teamWon && <XStack theme="green" bc="$backgroundStrong" p="$2" gap="$2" borderRadius="$4">
            <H2>🎉 {teamWon.name} won!</H2>
        </XStack>}
        <ScrollView flex={1}>
          <XStack gap="$2">
            {teams.map((team, teamIndex) => {
              const teamScore = rounds.findLast(i => i[teamIndex])?.[teamIndex]?.[0] ?? 0;
              return (
                  <YStack flex={1} flexBasis={0} theme={team.color} bc="$background" borderRadius="$4" p="$2" gap="$2">
                    <XStack alignItems="center">
                      <H3 flex={1}>{team.name}</H3>
                      <H2>
                        {teamScore}
                      </H2>
                    </XStack>
                    <YStack flexDirection="column-reverse" gap="$2">
                      {rounds.map((scores, round) => {
                        const isCurrentRound = round === rounds.length - 1 && scores.findIndex(i => i === null) === teamIndex;
                        return (
                            <XStack gap="$2" p="$2" bc="$backgroundSoft" borderRadius="$4"
                                    borderColor={isCurrentRound ? "$borderColorFocus" : "transparent"} borderWidth={4}>
                              <H6 flex={1}>{team.players[round % team.players.length]?.name}</H6>
                              {scores[teamIndex] !== null && <>
                                  <Paragraph>
                                    {scores[teamIndex]?.[1] === 0 ? "❌ Strike" : scores[teamIndex]?.[1]}
                                  </Paragraph>
                                  <Paragraph textAlign="right" fontWeight="bold" width="$3">
                                    {scores[teamIndex]?.[0]}
                                  </Paragraph>
                              </>}
                            </XStack>
                        )
                      })}
                    </YStack>
                  </YStack>
              )
            })}
          </XStack>
        </ScrollView>
        <YStack theme={currentTeam?.color} width={400} maxWidth="100%" alignSelf="center" p="$2" gap="$2">
          <XStack gap="$2">
            <Button flex={1} onPress={() => enterScore(1)}>1</Button>
            <Button flex={1} onPress={() => enterScore(2)}>2</Button>
            <Button flex={1} onPress={() => enterScore(3)}>3</Button>
          </XStack>
          <XStack gap="$2">
            <Button flex={1} onPress={() => enterScore(4)}>4</Button>
            <Button flex={1} onPress={() => enterScore(5)}>5</Button>
            <Button flex={1} onPress={() => enterScore(6)}>6</Button>
          </XStack>
          <XStack gap="$2">
            <Button flex={1} onPress={() => enterScore(7)}>7</Button>
            <Button flex={1} onPress={() => enterScore(8)}>8</Button>
            <Button flex={1} onPress={() => enterScore(9)}>9</Button>
          </XStack>
          <XStack gap="$2">
            <Button flex={1} onPress={() => enterScore(10)}>10</Button>
            <Button flex={1} onPress={() => enterScore(11)}>11</Button>
            <Button flex={1} onPress={() => enterScore(12)}>12</Button>
          </XStack>
          <XStack gap="$2">
            <Button flex={1} theme="gray" icon={Undo} onPress={() => undo()}>Undo</Button>
            <Button flex={1} theme="red" icon={X} onPress={() => enterScore(0)}>Strike</Button>
          </XStack>
        </YStack>
      </YStack>
  );
}

function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

export function HomeScreen() {
  const [isEditing, setIsEditing] = useState(true);
  const [teams, setTeams] = useLocalStorageState<Team[]>("teams_v1", [])
  const [target, setTarget] = useLocalStorageState<string>("target_v1", "50");

  if (!isEditing) {
    return <PlayScreen target={Number(target)} goBack={() => setIsEditing(true)} teams={teams}/>
  }

  return (
      <YStack flex={1} bc="$background" gap="$2" p="$2">
        <Paragraph>Target (default 50)</Paragraph>
        <Input placeholder="Target" value={target} onChangeText={setTarget}/>
        <XStack gap="$2" flex={1}>
          {teams.map(team => {
            const setTeam = (newTeam: Team) => {
              setTeams(teams.map(t => t === team ? newTeam : t))
            }
            return (
                <YStack flex={1} theme={team.color} bc="$backgroundSoft" borderRadius="$4" p="$2" gap="$2"
                        borderWidth="$1" borderColor="$borderColor">
                  <Input
                      placeholder="Team Name"
                      value={team.name}
                      onChangeText={text => {
                        setTeam({...team, name: text})
                      }}
                  />
                  <XStack justifyContent="space-evenly" gap="$2" flexWrap="wrap">
                    <Button w="$10" theme="red" onPress={() => setTeam({...team, color: "red"})}>Red</Button>
                    <Button w="$10" theme="orange" onPress={() => setTeam({...team, color: "orange"})}>Orange</Button>
                    <Button w="$10" theme="yellow" onPress={() => setTeam({...team, color: "yellow"})}>Yellow</Button>
                    <Button w="$10" theme="green" onPress={() => setTeam({...team, color: "green"})}>Green</Button>
                    <Button w="$10" theme="blue" onPress={() => setTeam({...team, color: "blue"})}>Blue</Button>
                    <Button w="$10" theme="purple" onPress={() => setTeam({...team, color: "purple"})}>Purple</Button>
                    <Button w="$10" theme="pink" onPress={() => setTeam({...team, color: "pink"})}>Pink</Button>
                  </XStack>
                  {team.players.map(player => {
                    const setPlayer = (newPlayer: typeof player) => {
                      setTeam({...team, players: team.players.map(p => p === player ? newPlayer : p)})
                    }
                    return (
                        <XStack ai="center" gap="$2">
                          <Input
                              flex={1}
                              placeholder="Player Name"
                              value={player.name}
                              onChangeText={text => {
                                setPlayer({...player, name: text})
                              }}
                          />
                          <Button chromeless theme="red" icon={Trash}
                                  onPress={() => setTeam({...team, players: team.players.filter(p => p !== player)})}/>
                        </XStack>
                    )
                  })}
                  <Button icon={UserPlus} onPress={() => {
                    setTeam({
                      ...team, players: [...team.players, {
                        name: "",
                        avatar: ""
                      }]
                    })
                  }}>Add Player</Button>

                  <YStack flex={1}/>

                  <Button icon={Trash} theme="red" onPress={() => {
                    setTeams(teams.filter(t => t !== team))
                  }}>Delete Team</Button>
                </YStack>
            );
          })}
        </XStack>
        <XStack gap="$2">
          <Button icon={Plus} flex={1} onPress={() => {
            setTeams([...teams, {
              name: "",
              color: "blue",
              players: []
            }])
          }}>Add Team</Button>
          <Button flex={1} theme="green" icon={Check} onPress={() => {
            if (Number(target) % 2 !== 0) {
              alert("Target must be even");
              return;
            }
            setIsEditing(!isEditing);
          }}>Done</Button>
        </XStack>
      </YStack>
  );
}
