import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seedNow() {
  try {
    const farmer = await prisma.user.findFirst({ where: { role: 'FARMER' } }) ||
                   await prisma.user.findFirst();
    if (!farmer) {
      console.error('No farmer or user found in DB!');
      return;
    }
    console.log('Seeding products under farmer:', farmer.name, farmer.id);

    const now = new Date();

    const items = [
      // 🥛 DAIRY
      {
        farmerId: farmer.id,
        cropName: 'Fresh Raw Cow Milk',
        category: 'DAIRY',
        unit: 'litres',
        availableQty: 1200,
        unitPrice: 0.45, // ~KES 58/L
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Limuru, Kiambu County',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Fresh Pasteurized Goat Milk',
        category: 'DAIRY',
        unit: 'litres',
        availableQty: 350,
        unitPrice: 0.92, // ~KES 120/L
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Nyeri Dairy Co-op, Nyeri County',
        imageUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Cultured Mala & Natural Probiotic Yoghurt',
        category: 'DAIRY',
        unit: 'litres',
        availableQty: 500,
        unitPrice: 0.85, // ~KES 110/L
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Eldoret Dairies, Uasin Gishu',
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Pure Camel Milk (Fresh Unpasteurized)',
        category: 'DAIRY',
        unit: 'litres',
        availableQty: 400,
        unitPrice: 1.23, // ~KES 160/L
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Isiolo Pastoralist Hub, Isiolo County',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'KCC-Grade Chilled Bulk Raw Milk',
        category: 'DAIRY',
        unit: 'litres',
        availableQty: 4500,
        unitPrice: 0.43, // ~KES 56/L
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Nyahururu Dairy Hub, Laikipia County',
        imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Pure Grass-Fed Traditional Ghee (1kg Jars)',
        category: 'DAIRY',
        unit: 'kg',
        availableQty: 250,
        unitPrice: 10.77, // ~KES 1,400/kg
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Maasai Mara Pastoralists, Narok',
        imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Cultured Buttermilk / Traditional Mtindi',
        category: 'DAIRY',
        unit: 'litres',
        availableQty: 600,
        unitPrice: 0.81, // ~KES 105/L
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Meru Central Dairy Co-op, Meru',
        imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop'
      },

      // 🐄 LIVESTOCK
      {
        farmerId: farmer.id,
        cropName: 'Pedigree Friesian Dairy Cow (In-Calf)',
        category: 'LIVESTOCK',
        unit: 'heads',
        availableQty: 4,
        unitPrice: 884.6, // ~KES 115,000/head
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Naivasha, Nakuru County',
        imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Ayrshire High-Yield Heifer (In-Calf 6 Months)',
        category: 'LIVESTOCK',
        unit: 'heads',
        availableQty: 6,
        unitPrice: 730.7, // ~KES 95,000/head
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Eldoret, Uasin Gishu County',
        imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Boer Breeding Buck (Stud Quality)',
        category: 'LIVESTOCK',
        unit: 'heads',
        availableQty: 12,
        unitPrice: 215.3, // ~KES 28,000/head
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Machakos Breeding Station, Machakos',
        imageUrl: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Galla Meat Goats (Mature Batch)',
        category: 'LIVESTOCK',
        unit: 'heads',
        availableQty: 25,
        unitPrice: 96.1, // ~KES 12,500/head
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Kitui Pastoralists Co-op, Kitui',
        imageUrl: 'https://images.unsplash.com/photo-1524024973431-2ad916746881?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Dorper Breeding Sheep (Fat-Tailed)',
        category: 'LIVESTOCK',
        unit: 'heads',
        availableQty: 30,
        unitPrice: 107.6, // ~KES 14,000/head
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Kajiado Plains Ranch, Kajiado County',
        imageUrl: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Pure Boran Beef Bull (Grass-Fed Feeder)',
        category: 'LIVESTOCK',
        unit: 'heads',
        availableQty: 8,
        unitPrice: 653.8, // ~KES 85,000/head
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Laikipia Nature Conservancy, Laikipia',
        imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Sahiwal Dual-Purpose Breeding Cow',
        category: 'LIVESTOCK',
        unit: 'heads',
        availableQty: 5,
        unitPrice: 807.7, // ~KES 105,000/head
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Naivasha Research Farm, Nakuru',
        imageUrl: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Large White Breeding Pig (Sow / Gilt)',
        category: 'LIVESTOCK',
        unit: 'heads',
        availableQty: 8,
        unitPrice: 246.1, // ~KES 32,000/head
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Thika Farmstead, Kiambu County',
        imageUrl: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&auto=format&fit=crop'
      },

      // 🐔 POULTRY
      {
        farmerId: farmer.id,
        cropName: 'Improved Kienyeji Chickens (Mature)',
        category: 'POULTRY',
        unit: 'birds',
        availableQty: 250,
        unitPrice: 7.3, // ~KES 950/bird
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Wangige, Kiambu County',
        imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Fresh Kienyeji Eggs (30-Egg Trays)',
        category: 'POULTRY',
        unit: 'trays',
        availableQty: 180,
        unitPrice: 3.23, // ~KES 420/tray
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Thika, Kiambu County',
        imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Commercial Broiler Chickens (Live Farm-Gate, 1.8kg)',
        category: 'POULTRY',
        unit: 'birds',
        availableQty: 800,
        unitPrice: 4.00, // ~KES 520/bird
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Kitengela, Kajiado County',
        imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'High-Peak Commercial Layers (ISA Brown)',
        category: 'POULTRY',
        unit: 'birds',
        availableQty: 450,
        unitPrice: 6.53, // ~KES 850/bird
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Ruaka, Kiambu County',
        imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Day-Old Improved Kienyeji Chicks (Vaccinated)',
        category: 'POULTRY',
        unit: 'birds',
        availableQty: 1500,
        unitPrice: 0.85, // ~KES 110/bird
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Wangige Hatcheries, Kiambu',
        imageUrl: 'https://images.unsplash.com/photo-1563281577-a7be47e20db9?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Kuroiler Dual-Purpose Mature Birds',
        category: 'POULTRY',
        unit: 'birds',
        availableQty: 350,
        unitPrice: 8.46, // ~KES 1,100/bird
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Machakos Rural Hub, Machakos County',
        imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop'
      },

      // 🌿 FODDER & FEEDS
      {
        farmerId: farmer.id,
        cropName: 'Boma Rhodes Hay Bales (18kg)',
        category: 'FODDER_FEEDS',
        unit: 'bales',
        availableQty: 500,
        unitPrice: 2.46, // ~KES 320/bale
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Rumuruti, Laikipia County',
        imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Lucerne / Alfalfa Hay Bales (High Protein 20%)',
        category: 'FODDER_FEEDS',
        unit: 'bales',
        availableQty: 350,
        unitPrice: 4.46, // ~KES 580/bale
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Naivasha Fodder Scheme, Nakuru',
        imageUrl: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Inoculated Maize Silage (50kg Sealed Bags)',
        category: 'FODDER_FEEDS',
        unit: 'bags',
        availableQty: 400,
        unitPrice: 5.76, // ~KES 750/bag
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Kitale Grain & Silage Hub, Trans Nzoia',
        imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'High-Yield Dairy Meal (16% CP, 70kg Bag)',
        category: 'FODDER_FEEDS',
        unit: 'bags',
        availableQty: 200,
        unitPrice: 21.92, // ~KES 2,850/bag
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Nakuru Feed Millers, Nakuru Town',
        imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop'
      },
      {
        farmerId: farmer.id,
        cropName: 'Wheat Pollard & Bran Blend (50kg Bag)',
        category: 'FODDER_FEEDS',
        unit: 'bags',
        availableQty: 250,
        unitPrice: 12.69, // ~KES 1,650/bag
        grade: 'GRADE_A',
        harvestDate: now,
        location: 'Thika Agro Millers, Kiambu',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop'
      }
    ];

    let inserted = 0;
    for (const it of items) {
      const exists = await prisma.produceListing.findFirst({
        where: { cropName: it.cropName }
      });
      if (!exists) {
        await prisma.produceListing.create({ data: it });
        inserted++;
      }
    }
    console.log(`Successfully seeded ${inserted} products across all new categories!`);
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seedNow();
