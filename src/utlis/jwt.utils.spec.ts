import { jwtRequestExtract } from "./jwt.utils";

describe('jwtRequestExtract', () => {
  it('should extract token from authorization header', () => {
    const request = {
      headers: {
        authorization: 'Bearer asdas0das09dj0s9ajd9sajd09sja', // Replace 'your_token_here' with an example token
      },
    };

    const token = jwtRequestExtract(request);

    expect(token).toBe('asdas0das09dj0s9ajd9sajd09sja'); // Replace 'your_token_here' with the same example token
  });

  it('should return undefined if authorization header is not present', () => {
    const request = {
      headers: {},
    };

    const token = jwtRequestExtract(request);

    expect(token).toBeUndefined();
  });

  it('should return undefined if Bearer token is not present in authorization header', () => {
    const request = {
      headers: {
        authorization: 'something',
      },
    };

    const token = jwtRequestExtract(request);

    expect(token).toBeUndefined();
  });
});
