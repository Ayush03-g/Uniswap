export const maleAvatarSeeds = [
  "male_1", "male_2", "male_3", "male_4", "male_5", 
  "male_6", "male_7", "male_8", "male_9", "male_10"
];

export const getRandomMaleAvatar = () => {
  const seed = maleAvatarSeeds[Math.floor(Math.random() * maleAvatarSeeds.length)];
  return `/avatars/${seed}.svg`;
};

export const getMaleAvatarForUser = (name: string | undefined) => {
  if (!name) return getRandomMaleAvatar();
  
  // Create a simple hash of the name to consistently pick the same avatar for the same user
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % maleAvatarSeeds.length;
  const seed = maleAvatarSeeds[index];
  
  return `/avatars/${seed}.svg`;
};
