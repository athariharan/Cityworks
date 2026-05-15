import api from "./api";
 
const CitizenService = {
  getMyRequests: (citizenId) =>
    api.get(`/api/user/servicereq/my`, { params: { citizenId } }),
};
 
export default CitizenService;