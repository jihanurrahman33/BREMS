// Development accounts configuration
// WARNING: These are for development only - NEVER use on mainnet!

module.exports = {
  accounts: [
    {
      name: "Property Owner 1",
      address: "0x15885fA5fd3e47CC927c543F175bdcaAF4183ec5",
      privateKey:
        "0x7fc16fe04d16d7d1bf13bf69a08df6e25f80978bb9cea62da10dd963f25b6464",
    },
    {
      name: "Property Owner 2",
      address: "0x4C062a5004f54f03Ac92D0539DBdF222e53d5979",
      privateKey:
        "0xf6e2be99092cdbef3d7df8cfc9a0f97065267f130baee60b2a0edf5fb085c4e3",
    },
    {
      name: "Investor 1",
      address: "0xAD85D92BcC271e7bA8912d7E88CE116A932141e1",
      privateKey:
        "0xe350ef0c6957bc418105fc911e452565d01ccdfef009d3ee9e1fd996829360c4",
    },
    {
      name: "Investor 2",
      address: "0xf5a361DC5CD4b93621EfFAaB11F154c0739fd7c8",
      privateKey:
        "0x8fee9ad4fa26e0ee4de3f57b41100cbfdb4f1d567ed6f1304a985a2d99978a47",
    },
    {
      name: "Platform Admin",
      address: "0x3BB263C44B9c92474BD75B9b6cBCA44236C37971",
      privateKey:
        "0x1d8d87ced03e35e19c6957e8e208f42519826f731fd08d778028c1cb39fe4f7e",
    },
  ],

  // Helper function to get account by name
  getAccountByName: function (name) {
    return this.accounts.find((acc) => acc.name === name);
  },

  // Helper function to get account by address
  getAccountByAddress: function (address) {
    return this.accounts.find(
      (acc) => acc.address.toLowerCase() === address.toLowerCase()
    );
  },
};
