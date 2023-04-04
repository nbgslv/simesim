export default class ShortIoApi {
  private static apiUrl: string = 'https://api.short.io/links/';

  static async shortenUrl(url: string) {
    try {
      const shortUrlResponse = await fetch(ShortIoApi.apiUrl, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          authorization: process.env.SHORT_IO_API_KEY!,
        },
        body: JSON.stringify({
          originalURL: url,
          domain: 'go.simesim.co.il',
        }),
      });
      const shortUrl = await shortUrlResponse.json();
      return shortUrl.secureShortURL;
    } catch (error) {
      console.error(error);
      throw new Error((error as Error).message);
    }
  }
}
