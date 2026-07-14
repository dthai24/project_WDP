/**
 * WDP English - Sync Seed Script
 * Bridges the prototype collections (modules, lessons) from data/seed.js
 * to the final schemas (paths, pathnodes, nodematerials).
 * Also seeds correct Roles and UserRoles collections in MongoDB.
 */

const { MongoClient, ObjectId } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = "wdp_english";

// Static Role ObjectIds
const ROLES = {
  Admin: { _id: new ObjectId("66a1a1a1a1a1a1a1a1a1a1a1"), roleName: "Admin", description: "Administrator" },
  Mentor: { _id: new ObjectId("66a2a2a2a2a2a2a2a2a2a2a2"), roleName: "Mentor", description: "Instructor / Mentor" },
  Student: { _id: new ObjectId("66a3a3a3a3a3a3a3a3a3a3a3"), roleName: "Student", description: "Learner" }
};

async function sync() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB for syncing collections...");
    const db = client.db(DB_NAME);

    // 1. Clean existing collections
    const collectionsToClean = ["paths", "pathnodes", "nodematerials", "roles", "userroles"];
    for (const name of collectionsToClean) {
      const collections = await db.listCollections({ name }).toArray();
      if (collections.length > 0) {
        await db.collection(name).drop();
        console.log(`  🗑  Dropped old: ${name}`);
      }
    }

    // 2. Seed Roles
    await db.collection("roles").insertMany(Object.values(ROLES));
    console.log("  ✅ Seeded 3 Roles (Admin, Mentor, Student)");

    // 3. Seed UserRoles based on users in database
    const users = await db.collection("users").find().toArray();
    const userRolesData = [];

    for (const user of users) {
      const email = user.email.toLowerCase().trim();
      let roleId = ROLES.Student._id; // default

      if (email === "admin@wdp.edu.vn") {
        roleId = ROLES.Admin._id;
      } else if (email.startsWith("mentor.")) {
        roleId = ROLES.Mentor._id;
      }

      userRolesData.push({
        _id: new ObjectId(),
        userId: user._id,
        roleId: roleId
      });
    }

    if (userRolesData.length > 0) {
      await db.collection("userroles").insertMany(userRolesData);
      console.log(`  ✅ Seeded ${userRolesData.length} UserRole mappings`);
    }

    // 4. Read prototype modules and sync to paths
    const modules = await db.collection("modules").find().toArray();
    const pathsData = modules.map(mod => ({
      _id: mod._id,
      courseId: mod.courseId,
      pathName: mod.title,
      description: mod.description || mod.title,
      order: mod.order,
      createdAt: mod.createdAt || new Date(),
      updatedAt: mod.updatedAt || new Date()
    }));
    if (pathsData.length > 0) {
      await db.collection("paths").insertMany(pathsData);
      console.log(`  ✅ Synced ${pathsData.length} paths`);
    }

    // 5. Read prototype lessons and sync to pathnodes & nodematerials
    const lessons = await db.collection("lessons").find().toArray();
    const pathnodesData = [];
    const nodematerialsData = [];

    for (const les of lessons) {
      // Create pathnode
      pathnodesData.push({
        _id: les._id,
        pathId: les.moduleId,
        nodeName: les.title,
        nodeOrder: les.order,
        description: les.title,
        isFree: les.free || false
      });

      // Create nodematerial
      let matType = "VIDEO";
      if (les.type === "document") matType = "DOC";
      else if (les.type === "quiz") matType = "TEXT"; // map quiz type to TEXT material
      else if (les.type === "audio") matType = "AUDIO";

      nodematerialsData.push({
        _id: new ObjectId(),
        nodeId: les._id,
        materialType: matType,
        title: les.title,
        materialUrl: les.videoUrl || (les.document ? les.document.fileUrl : null) || "",
        materialOrder: 1,
        sourceType: "LINK",
        fileName: les.document ? les.document.title : null,
        fileSize: les.document && les.document.fileSize ? parseFloat(les.document.fileSize) : null,
        content: les.document ? les.document.content : null
      });
    }

    if (pathnodesData.length > 0) {
      await db.collection("pathnodes").insertMany(pathnodesData);
      console.log(`  ✅ Synced ${pathnodesData.length} pathnodes`);
    }
    if (nodematerialsData.length > 0) {
      await db.collection("nodematerials").insertMany(nodematerialsData);
      console.log(`  ✅ Synced ${nodematerialsData.length} nodematerials`);
    }

    console.log("\n🎉 Sync seed completed successfully!");
  } catch (err) {
    console.error("❌ Sync seed failed:", err.message);
  } finally {
    await client.close();
  }
}

sync();
