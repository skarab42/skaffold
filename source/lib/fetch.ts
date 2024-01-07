import https from 'node:https';

export async function fetchJson<Json = unknown>(url: string): Promise<Json> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        const data: string[] = [];

        response.on('data', (chunk: string) => {
          data.push(chunk);
        });

        response.on('end', () => {
          resolve(JSON.parse(data.join('')) as Json);
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

export type NodeRelease = {
  start: string;
  end: string;
  lts?: string;
  maintenance?: string;
  codename?: string;
};

export type NodeReleaseSchedule = Record<string, NodeRelease>;

export async function fetchNodeReleaseSchedule(): Promise<NodeReleaseSchedule> {
  return fetchJson('https://raw.githubusercontent.com/nodejs/Release/main/schedule.json');
}

export type NodeReleaseWithCodename = NodeRelease & {
  codename: string;
};

export function isNodeReleaseWithCodename(release: NodeRelease): release is NodeReleaseWithCodename {
  return release.codename !== undefined;
}

export async function fetchCurrentNodeVersions(): Promise<string[]> {
  const releaseSchedule = await fetchNodeReleaseSchedule();
  const releases = Object.entries(releaseSchedule);
  const currentDate = new Date();

  return releases
    .filter(([, release]) => {
      return (
        isNodeReleaseWithCodename(release) &&
        currentDate >= new Date(release.start) &&
        currentDate <= new Date(release.end)
      );
    })
    .map(([version]) => version.slice(1));
}
