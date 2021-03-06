import {
  Button,
  Checkbox,
  EthHashInfo,
  Text,
  Title
} from '@gnosis.pm/safe-react-components'
import { WalletState } from 'components/App'
import CPK from 'contract-proxy-kit'
import React, { useState } from 'react'
import styled from 'styled-components'
import { formatBalance } from 'utils/balances'
import { getNetworkNameFromId } from 'utils/networks'

const Line = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
`

const SLine = styled(Line)`
  padding: 0;
`

const SButton = styled(Button)`
  width: 100%;
`

const TitleLine = styled.div`
  margin-right: 10px;
`

interface TransactionsProps {
  cpk: CPK
  walletState: WalletState
  enabledRocksideTxRelay: boolean
  setEnabledRocksideTxRelay: Function
}

const Transactions = ({
  cpk,
  walletState,
  enabledRocksideTxRelay,
  setEnabledRocksideTxRelay
}: TransactionsProps) => {
  const [txHash, setTxHash] = useState<string | null | undefined>()
  const [safeTxHash, setSafeTxHash] = useState<string | undefined>()
  const [showTxError, setShowTxError] = useState<boolean>(false)

  const makeTransaction = async (): Promise<void> => {
    if (!walletState.ownerAddress) return
    let txResult
    setShowTxError(false)
    setTxHash('')

    const txs = [
      {
        to: walletState.ownerAddress,
        value: `${11e17}`
      }
    ]
    try {
      txResult = await cpk.execTransactions(txs)
    } catch (e) {
      console.log(e)
      setShowTxError(true)
    }

    if (txResult?.safeTxHash) {
      setSafeTxHash(txResult.safeTxHash)
    }
    if (txResult?.hash) {
      setTxHash(txResult.hash)
    }
  }

  const getTransactionHashIfSafeApp = async () => {
    if (!safeTxHash) return
    const safeTransaction = await cpk.safeAppsSdkConnector?.getBySafeTxHash(
      safeTxHash
    )
    setTxHash(safeTransaction?.transactionHash)
  }

  return (
    <>
      <Title size="sm">Information</Title>
      <Line>
        <TitleLine>
          <Text size="xl" strong>
            CPK Balance:
          </Text>
        </TitleLine>
        <Text size="xl">{formatBalance(walletState?.cpkBalance)}</Text>
      </Line>
      <Title size="sm">Configuration</Title>
      <SLine>
        <Checkbox
          name="checkboxTxRelay"
          checked={enabledRocksideTxRelay}
          onChange={(_, checked) => setEnabledRocksideTxRelay(checked)}
          label="Use Rockside transaction relay"
        />
      </SLine>
      <Title size="sm">Transactions</Title>
      <Line>
        <SButton
          onClick={makeTransaction}
          size="lg"
          color="primary"
          variant="contained"
        >
          Send 1.1 ETH to the CPK owner
        </SButton>
      </Line>
      {showTxError && (
        <Line>
          <Text size="xl" color="error">
            Transaction rejected
          </Text>
        </Line>
      )}
      {safeTxHash && (
        <Line>
          <TitleLine>
            <Text size="xl" as="span" strong>
              Safe transaction hash:
            </Text>
          </TitleLine>
          <EthHashInfo
            hash={safeTxHash}
            textSize="xl"
            shortenHash={8}
            showCopyBtn
            network={getNetworkNameFromId(walletState?.networkId)}
          />
        </Line>
      )}
      {walletState.isSafeApp && safeTxHash && (
        <Line>
          <SButton
            onClick={getTransactionHashIfSafeApp}
            size="lg"
            color="primary"
            variant="contained"
          >
            Get transaction hash
          </SButton>
        </Line>
      )}
      {txHash && (
        <Line>
          <TitleLine>
            <Text size="xl" as="span" strong>
              Transaction hash:
            </Text>
          </TitleLine>
          <EthHashInfo
            hash={txHash}
            textSize="xl"
            shortenHash={8}
            showEtherscanBtn
            showCopyBtn
            network={getNetworkNameFromId(walletState?.networkId)}
          />
        </Line>
      )}
    </>
  )
}

export default Transactions
