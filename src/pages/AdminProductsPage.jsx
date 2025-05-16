import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingBag, Code, Map, Palette, Brain, Trash2, Edit, Plus, Image, Save, Eye
} from 'lucide-react';
import { supabase, supabaseQuery, isSupabaseConnected } from '@/lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const iconComponents = {
  Code: Code,
  ShoppingBag: ShoppingBag,
  Map: Map,
  Palette: Palette,
  Brain: Brain
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    selectedIcon: 'Code',
    imageUrl: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('Error al cargar productos:', error);
        setProducts([]);
      } else {
        // Asegurarnos que todos los productos tienen los campos necesarios
        const processedProducts = (data || []).map(product => ({
          ...product,
          // Garantizar que icon_name existe
          icon_name: product.icon_name || 'Code',
          // Convertir price a número si es string
          price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
        }));

        setProducts(processedProducts);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'price') {
      // Solo permitir números y un punto decimal
      const regex = /^\d*\.?\d{0,2}$/;
      if (value === '' || regex.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado correctamente."
      });

      fetchProducts();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el producto."
      });
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`; // ¡Importante! No usar subcarpetas si no está configurado en Supabase

    try {
      // Verificar tamaño del archivo
      if (imageFile.size > 5 * 1024 * 1024) {
        throw new Error("La imagen no debe superar los 5MB");
      }

      // Mostrar toast de carga
      toast({
        title: "Subiendo imagen",
        description: "Espera mientras se sube la imagen...",
      });

      const { data, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error("Error de subida:", uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente."
      });

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo subir la imagen. " + (error.message || "Verifica las políticas de acceso en Supabase.")
      });
      return null;
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      selectedIcon: 'Code',
      imageUrl: ''
    });
    setImageFile(null);
    setImagePreview('');
    setSelectedProduct(null);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      selectedIcon: product.icon_name || 'Code',
      imageUrl: product.image_url || ''
    });
    setImagePreview(product.image_url || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, completa todos los campos requeridos."
      });
      return;
    }

    try {
      let imageUrl = formData.imageUrl;
      
      // Subir nueva imagen si se seleccionó una
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        icon_name: formData.selectedIcon,
        image_url: imageUrl
      };

      if (selectedProduct) {
        // Actualizar producto existente
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', selectedProduct.id);

        if (error) throw error;

        toast({
          title: "Producto actualizado",
          description: "El producto ha sido actualizado correctamente."
        });
      } else {
        // Añadir nuevo producto
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;

        toast({
          title: "Producto añadido",
          description: "El producto ha sido añadido correctamente."
        });
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `No se pudo guardar el producto: ${error.message}`
      });
    }
  };

  const renderIconPreview = () => {
    const IconComponent = iconComponents[formData.selectedIcon];
    return IconComponent ? <IconComponent className="h-8 w-8 text-primary" /> : null;
  };

  return (
    <div className="container mx-auto py-12 space-y-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-4 gradient-text">Administrar Productos</h1>
      </motion.div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-8">
          <TabsTrigger value="products">
            <ShoppingBag className="mr-2 h-4 w-4" /> 
            Lista de Productos
          </TabsTrigger>
          <TabsTrigger value="add">
            <Plus className="mr-2 h-4 w-4" /> 
            {selectedProduct ? 'Editar Producto' : 'Añadir Producto'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {loading ? (
            <div className="flex justify-center p-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.length === 0 ? (
                <div className="col-span-full text-center p-10">
                  <p className="text-muted-foreground">No hay productos disponibles.</p>
                  <Button 
                    onClick={() => document.querySelector('button[value="add"]').click()}
                    className="mt-4 bg-primary hover:bg-primary/90"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Añadir Producto
                  </Button>
                </div>
              ) : (
                products.map((product) => {
                  const IconComponent = iconComponents[product.icon_name] || Code;
                  
                  return (
                    <Card key={product.id} className="overflow-hidden border-primary/30 hover:border-primary/60 transition-all duration-300">
                      <div className="relative aspect-video bg-black/20 overflow-hidden">
                        {product.image_url ? (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <IconComponent className="h-16 w-16 text-primary/50" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 p-2 bg-black/60 rounded-full">
                          <IconComponent className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{product.name}</CardTitle>
                          <div className="p-2 bg-primary/20 rounded-full">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-sm text-muted-foreground">
                          {product.description.split('\n').slice(0, 2).map((line, i) => (
                            <p key={i} className="mb-1">{line}</p>
                          ))}
                          {product.description.split('\n').length > 2 && <p className="text-xs text-muted-foreground">...</p>}
                        </div>
                        <p className="text-xl font-bold text-primary">${product.price.toFixed(2)}</p>
                        
                        <div className="flex justify-between pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="bg-red-500/20 text-red-500 hover:bg-red-500/30 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add">
          <Card className="max-w-2xl mx-auto border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center">
                {selectedProduct ? (
                  <>
                    <Edit className="h-5 w-5 mr-2" /> Editar Producto
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5 mr-2" /> Añadir Nuevo Producto
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-muted-foreground mb-1">
                    Nombre del Producto
                  </Label>
                  <Input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    placeholder="Software de Productividad X" 
                    className="bg-black/20 border-primary/30 focus:border-primary" 
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-muted-foreground mb-1">
                    Descripción
                  </Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    placeholder="Maximiza tu eficiencia con esta herramienta." 
                    className="bg-black/20 border-primary/30 focus:border-primary" 
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-sm font-medium text-muted-foreground mb-1">
                      Precio
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                      <Input 
                        type="text" 
                        id="price" 
                        name="price" 
                        value={formData.price} 
                        onChange={handleInputChange} 
                        placeholder="49.99" 
                        className="bg-black/20 border-primary/30 focus:border-primary pl-8" 
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="category" className="text-sm font-medium text-muted-foreground mb-1">
                      Categoría
                    </Label>
                    <Input 
                      type="text" 
                      id="category" 
                      name="category" 
                      value={formData.category} 
                      onChange={handleInputChange} 
                      placeholder="Software" 
                      className="bg-black/20 border-primary/30 focus:border-primary" 
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="icon" className="text-sm font-medium text-muted-foreground mb-1">
                      Icono
                    </Label>
                    <Select
                      value={formData.selectedIcon}
                      onValueChange={(value) => handleSelectChange('selectedIcon', value)}
                    >
                      <SelectTrigger className="w-full bg-black/20 border-primary/30 focus:ring-primary">
                        <SelectValue placeholder="Selecciona un ícono" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Code">Código</SelectItem>
                        <SelectItem value="Palette">Paleta</SelectItem>
                        <SelectItem value="Brain">Cerebro</SelectItem>
                        <SelectItem value="ShoppingBag">Bolsa</SelectItem>
                        <SelectItem value="Map">Mapa</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="mt-2 p-4 flex justify-center items-center bg-black/10 rounded-md border border-primary/20">
                      {renderIconPreview()}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="image" className="text-sm font-medium text-muted-foreground mb-1">
                      Imagen del Producto
                    </Label>
                    <div className="mt-1 flex items-center">
                      <label className="block w-full">
                        <span className="sr-only">Seleccionar Imagen</span>
                        <Input
                          id="image"
                          name="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary/20 file:text-primary
                            hover:file:bg-primary/30"
                        />
                      </label>
                    </div>
                    
                    {(imagePreview || formData.imageUrl) && (
                      <div className="mt-2 aspect-video overflow-hidden rounded-md border border-primary/20">
                        <img 
                          src={imagePreview || formData.imageUrl} 
                          alt="Vista previa" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    className="border-primary/30 text-muted-foreground hover:bg-primary/10"
                  >
                    {selectedProduct ? 'Cancelar Edición' : 'Limpiar Formulario'}
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {selectedProduct ? 'Actualizar Producto' : 'Guardar Producto'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProductsPage; 