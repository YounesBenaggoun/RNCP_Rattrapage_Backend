import Pool from "../../3_InfraStructure/database/database.js";
import PostgresOniRepository from "../../3_InfraStructure/repositories/Postgress.Oni.repository.js";



const repository = new PostgresOniRepository({ pool: Pool });


const OniController = {};


OniController.getAll = async (req, res) => {
    try {
        const result = await repository.getAll();
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode ?? 500).json({ message: error.message });
    }
};

OniController.findDuplicatedData = async (req, res) => {
    try {
        const result = await repository.findDuplicatedData();
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode ?? 500).json({ message: error.message });
    }
};


OniController.getByRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const result = await repository.getByRange(startDate, endDate);
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode ?? 500).json({ message: error.message });
    }
};



OniController.latest = async (req, res) => {
    try {
        const result = await repository.findLatest();
        res.status(200).json(result);
    } catch (error) {
        res.status(error.statusCode ?? 500).json({ message: error.message });
    }
};


export default OniController;