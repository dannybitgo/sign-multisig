/**
 * Construct and sign a multisig transaction that spends from a BitGo P2SH-P2WSH address using the user key and backup key
 */

const bitcoin = require('bitcoinjs-lib');
const bip32 = require('bip32');

// Todo: replace the values below with your network, keys, and derivation path
const net = 'testnet'; // Change this and use the line below instead if using mainnet
//const net = 'mainnet';
const userXprv = 'xprv9s21ZrQH143K47RNGfDmMNf5ML83o2etex9NWtZZZyTaDzdCWrcFwDTG6v2KvqeWybzvSw4JHXM1wa26jGSqWDnhaVgrASap6G6mcLe1jNn';
const backupXprv = 'xprv9s21ZrQH143K3pj8pbqD5Fdx4h4ufahHktJpX2EhSuwSNK6Vu5c3ZofXKoH6BRXtgndczS2KwFT63tCHV5Dyi8aB395cqaBPvv26aC5t31a';
const bitgoPublicKey = 'xpub661MyMwAqRbcGeNRSDceUgor9ZrqcYJWyN6kHfXu54CTrx3ANvGvodskCScFLZKceRTr3s1x1HunGVDUPRzMWeCaYTRb94s6NiDKaPSf1Mq';
const derivationPath = 'm/0/0/10/2';
// End Todo

const network = net === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

const getHDNode = function(xprv, path) {
  const node = bip32.fromBase58(xprv);
  node.network = network;
  return node.derivePath(path);
  return bitcoin.ECPair.fromPrivateKey(derivedNode.privateKey);
}

const getScriptInfo = function(pubkeys) {
  const p2ms = bitcoin.payments.p2ms({ m: 2, pubkeys, network });
  const p2wsh = bitcoin.payments.p2wsh({ redeem: p2ms, network });
  const p2sh = bitcoin.payments.p2sh({ redeem: p2wsh, network });
  return { p2sh, p2wsh };
}

const userNode = getHDNode(userXprv, derivationPath);
const backupNode= getHDNode(backupXprv, derivationPath);
const bitgoNode = getHDNode(bitgoPublicKey, derivationPath);
const userSigner = bitcoin.ECPair.fromPrivateKey(userNode.privateKey, { network });
const backupSigner = bitcoin.ECPair.fromPrivateKey(backupNode.privateKey, { network });

const pubkeys = [userNode, backupNode, bitgoNode].map(node => node.publicKey);
const scriptInfo = getScriptInfo(pubkeys);

const inputData = {
  hash: '7071ad8b88cf58b575768580c64890cb71b5fac096476125a24322a268eb46c0',
  index: 1,
  redeemScript: scriptInfo.p2sh.redeem.output,
  witnessScript: scriptInfo.p2wsh.redeem.output,
  value: 100000,
};

const destinationData = {
  address: '2NBuJHF2ujAM9RrxqK8MpUeXaRRKL6PCBUp',
  value: 80000,
};

const txb = new bitcoin.TransactionBuilder(network);

txb.addInput(inputData.hash, inputData.index);
txb.addOutput(destinationData.address, destinationData.value);
txb.sign(0, userSigner, inputData.redeemScript, null, inputData.value, inputData.witnessScript);
txb.sign(0, backupSigner, inputData.redeemScript, null, inputData.value, inputData.witnessScript);

const hex = txb.build().toHex();
console.log(`\n\nSigned transaction:\n\n${hex}`);
