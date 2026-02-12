import React from 'react';
import { useNavigate } from 'react-router-dom';

const TransactionHistoryCard: React.FC = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/financial/transactions');
    };

    return (
        <div onClick={handleClick} className="bg-white p-4 rounded-lg shadow-md mt-4 cursor-pointer">
            <h2 className="text-lg font-semibold">Histórico de Transações</h2>
            <p className="text-sm text-gray-500">Clique para ver o histórico completo de transações</p>
        </div>
    );
};

export default TransactionHistoryCard;
