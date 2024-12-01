import useRole from "../../../hooks/useRole";
import AdminStatistics from "../Admin/AdminStatistics";


const Statistics = () => {
    const [role, isLoading] = useRole()
    return (
        <div>
            <>{role === 'admin' && <AdminStatistics/>}</>
        </div>
    );
};

export default Statistics;