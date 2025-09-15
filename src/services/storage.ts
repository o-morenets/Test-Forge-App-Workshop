import kvs from "@forge/kvs";

export const saveUserData = async (key: string, value: string) => {
  try {
    await kvs.set(key, value);

    return {
      success: true,
    };
  } catch (e) {
    console.log(`Error while saving data in kvs`);

    return {
      success: false,
    };
  }
};

export const loadUserData = async (key: string) => {
  try {
    const value = await kvs.get(key);

    return {
      success: true,
      data: value,
    };
  } catch (e) {
    console.log(`Error while loading data from kvs`);

    return {
      success: false,
    };
  }
};
