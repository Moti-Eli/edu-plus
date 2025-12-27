import configData from '@/data/config.json';

export const config = {
  cities: configData.cities,
  schools: configData.schools,
  instructors: configData.instructors,
  
  // פונקציות עזר
  getSchoolsByCity: (city: string) => 
    configData.schools.filter(s => s.city === city),
  
  getCityList: () => configData.cities,
  
  getSchoolList: () => configData.schools.map(s => s.name),
};

export type School = { name: string; city: string };
export type Instructor = { name: string; email: string };