import { axiosInstance, getConfig, setConfig } from "../utils";

export async function environment(str: string, opts: any) {
    if (!str) {
        console.log(getConfig("environment") || "No environment set");
        return;
    }

    if (!getConfig("token")) {
        console.log("You need to login first. Please run `configoat login` to login.");
        return;
    }

    axiosInstance.defaults.headers.common['Authorization'] = `User ${getConfig("token")}`;

    const [project, environment] = str.split("/");

    if (!project || !environment) {
        console.log("Invalid environment. Please use the format `project/environment`");
        return;
    }

    const projects = await axiosInstance.get('/projects').then(resp => resp.data);    

    const selectedProject = projects.find((p: any) => p.name === project);

    if (!selectedProject) {
        console.log("Project not found");
        return;
    }

    const environments = await axiosInstance.get(`/environments`, {
        params: {
            projectId: selectedProject._id
        }
    }).then(resp => resp.data.environments);

    const selectedEnvironment = environments.find((e: any) => e.name === environment);

    if (!selectedEnvironment) {
        console.log("Environment not found");
        return;
    }

    setConfig("environment", selectedEnvironment._id);
    
    console.log("Environment is set to", str);
}