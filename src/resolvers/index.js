import Resolver from '@forge/resolver';

const resolver = new Resolver();

resolver.define('getText', (req) => {
  console.log(req);
  return 'Hello, World!';
});

resolver.define('getAdminMainText', (req) => {
  console.log(req);
  return 'Hello, Admin!';
});

resolver.define('getAdminConfigureText', (req) => {
  console.log(req);
  return 'Let\'s configure your app!';
});

resolver.define('getAdminGetStartedText', (req) => {
  console.log(req);
  return 'Let\'s get started!';
});

export const handler = resolver.getDefinitions();
