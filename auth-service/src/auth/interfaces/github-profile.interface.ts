export interface GithubProfile {
  id: string;
  displayName: string;
  username: string;
  emails: {
    value: string;
  }[];
  photos: {
    value: string;
  }[];
}
