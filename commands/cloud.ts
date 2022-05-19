module.exports = {
  command: "cloud",
  desc: "Interact with Hathora Cloud",
  builder: (yargs: any) => {
    yargs.commandDir("cloud", {
      extensions: ["js", "ts"],
    });
  },
};
