import { ethers } from 'ethers'
import { DEFAULT_SLIPPAGE } from '../config'

export const calculateSlippageAmount = (value: ethers.BigNumber, slippage: number = DEFAULT_SLIPPAGE) => {
  if (!value) return [value, value]
  
  const offset = value.mul(Math.floor(slippage * 100)).div(10000)
  const minimum = value.sub(offset)
  const maximum = value.add(offset)
  
  return [minimum, maximum]
}

export const getDeadline = (minutes: number): number => {
  return Math.floor(Date.now() / 1000) + 60 * minutes
}

export const formatTokenAmount = (amount: ethers.BigNumber, decimals: number): string => {
  return ethers.utils.formatUnits(amount, decimals)
}

export const parseTokenAmount = (amount: string, decimals: number): ethers.BigNumber => {
  return ethers.utils.parseUnits(amount, decimals)
}

export const calculatePriceImpact = (
  inputAmount: ethers.BigNumber,
  outputAmount: ethers.BigNumber,
  inputDecimals: number,
  outputDecimals: number,
  inputPrice: number,
  outputPrice: number
): number => {
  const input = Number(formatTokenAmount(inputAmount, inputDecimals)) * inputPrice
  const output = Number(formatTokenAmount(outputAmount, outputDecimals)) * outputPrice
  return ((input - output) / input) * 100
}

export const sortTokens = (tokenA: string, tokenB: string): [string, string] => {
  return tokenA.toLowerCase() < tokenB.toLowerCase() 
    ? [tokenA, tokenB] 
    : [tokenB, tokenA]
}

export const getPairAddress = (
  factoryAddress: string,
  tokenA: string,
  tokenB: string,
  initCodeHash: string
): string => {
  const [token0, token1] = sortTokens(tokenA, tokenB)
  
  const salt = ethers.utils.keccak256(
    ethers.utils.solidityPack(['address', 'address'], [token0, token1])
  )
  
  return ethers.utils.getCreate2Address(
    factoryAddress,
    salt,
    initCodeHash
  )
} 