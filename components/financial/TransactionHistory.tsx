import React, { useState } from 'react';

const TransactionHistory: React.FC = () => {
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('total');

    // Placeholder for transaction data
    const transactions = [
        { id: 1, date: '2024-07-28', description: 'Venda de produto A', amount: 150.0, status: 'aprovado' },
        { id: 2, date: '2024-07-27', description: 'Transferência para conta bancária', amount: -500.0, status: 'transferido' },
        { id: 3, date: '2024-07-26', description: 'Venda de produto B', amount: 75.0, status: 'pendente' },
    ];

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
            <h2 className="text-lg font-semibold mb-4">Histórico de Transações</h2>
            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                    <button onClick={() => setStatusFilter('all')} className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Todos</button>
                    <button onClick={() => setStatusFilter('aprovado')} className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'aprovado' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>Aprovadas</button>
                    <button onClick={() => setStatusFilter('transferido')} className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'transferido' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}>Transferidas</button>
                    <button onClick={() => setStatusFilter('pendente')} className={`px-3 py-1 rounded-full text-sm ${statusFilter === 'pendente' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}>Pendentes</button>
                </div>
                <div className="flex space-x-2">
                    <select onChange={(e) => setDateFilter(e.target.value)} className="px-3 py-1 rounded-full text-sm bg-gray-200">
                        <option value="total">Total</option>
                        <option value="180">180 Dias</option>
                        <option value="90">90 Dias</option>
                        <option value="60">60 Dias</option>
                        <option value="30">30 Dias</option>
                        <option value="ontem">Ontem</option>
                        <option value="hoje">Hoje</option>
                    </select>
                </div>
            </div>
            <div>
                {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center border-b py-2">
                        <div>
                            <p className="font-semibold">{transaction.description}</p>
                            <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                        <div className={`text-right ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            <p className="font-semibold">R$ {transaction.amount.toFixed(2)}</p>
                            <p className="text-sm capitalize">{transaction.status}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionHistory;
