import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ShoppingBag, Code, Map, Palette, Brain, DollarSign, User, Mail, MessageSquare, Search, Copy, Check, ExternalLink, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { supabase, supabaseQuery, isSupabaseConnected } from '@/lib/supabaseClient';

// Mapeo de nombres de iconos a componentes
const iconComponents = {
  Code: Code,
  ShoppingBag: ShoppingBag,
  Map: Map,
  Palette: Palette,
  Brain: Brain
};

// Enlace a Discord como respaldo por si no se carga desde la base de datos
const discordInviteLink = "https://discord.com/invite/2FSkAJPHxY";

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({ discordUsername: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  // Cargar productos desde Supabase al montar el componente
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
        // Cargar productos locales si hay error
        setProducts([
          { id: 1, name: 'Software de Productividad X', description: 'Maximiza tu eficiencia con esta herramienta.', price: 49.99, category: 'Software', icon_name: 'Code' },
          { id: 2, name: 'Paquete de Gráficos "Neón Dreams"', description: 'Colección de assets visuales vibrantes.', price: 29.99, category: 'Diseño Gráfico', icon_name: 'Palette' },
          { id: 3, name: 'Curso Online: Desarrollo Web IA', description: 'Aprende a integrar IA en tus proyectos web.', price: 99.00, category: 'Educación', icon_name: 'Brain' },
          { id: 4, name: 'Plantillas de Video Editables', description: 'Acelera tu producción de contenido audiovisual.', price: 19.50, category: 'Multimedia', icon_name: 'ShoppingBag' },
          { id: 5, name: 'Ebook: Secretos del Marketing Digital', description: 'Guía completa para dominar el marketing online.', price: 15.00, category: 'Libros Digitales', icon_name: 'Map' },
        ]);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      // Fallback a productos predeterminados en caso de error
      setProducts([
        { id: 1, name: 'Software de Productividad X', description: 'Maximiza tu eficiencia con esta herramienta.', price: 49.99, category: 'Software', icon_name: 'Code' },
        { id: 2, name: 'Paquete de Gráficos "Neón Dreams"', description: 'Colección de assets visuales vibrantes.', price: 29.99, category: 'Diseño Gráfico', icon_name: 'Palette' },
        { id: 3, name: 'Curso Online: Desarrollo Web IA', description: 'Aprende a integrar IA en tus proyectos web.', price: 99.00, category: 'Educación', icon_name: 'Brain' },
        { id: 4, name: 'Plantillas de Video Editables', description: 'Acelera tu producción de contenido audiovisual.', price: 19.50, category: 'Multimedia', icon_name: 'ShoppingBag' },
        { id: 5, name: 'Ebook: Secretos del Marketing Digital', description: 'Guía completa para dominar el marketing online.', price: 15.00, category: 'Libros Digitales', icon_name: 'Map' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    // Validar formulario
    if (!selectedProduct || !formData.discordUsername || !formData.email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, completa todos los campos requeridos.",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Procesando pedido...");
    
    try {
      // Crear datos del pedido con un ID único
      const orderId = uuidv4().substring(0, 8).toUpperCase();
      
      // Crear el objeto de pedido de acuerdo a la estructura de la tabla existente
      const orderData = {
        order_id: orderId,
        product_name: selectedProduct.name,
        price: selectedProduct.price,
        discord_username: formData.discordUsername,
        email: formData.email,
        message: formData.message || '',
        status: 'Pendiente'
        // La columna created_at se genera automáticamente en la base de datos
      };
      
      console.log("Enviando datos a Supabase:", orderData);
      
      // Insertar el pedido en Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select();

      if (error) {
        console.error("Error de Supabase:", error);
        throw new Error(error.message);
      }

      console.log("Pedido guardado correctamente:", data);

      // Configurar datos para el modal de éxito
      setSuccessOrder({
        orderId: orderId,
        productName: selectedProduct.name,
        price: selectedProduct.price
      });
      
      // Limpiar el formulario y cerrar el modal
      setSelectedProduct(null);
      setFormData({ discordUsername: '', email: '', message: '' });
    } catch (error) {
      console.error('Error al procesar el pedido:', error);
      toast({
        variant: "destructive",
        title: "Error al procesar el pedido",
        description: `No se pudo registrar el pedido: ${error.message}`,
        duration: 7000
      });
    } finally {
      setIsSubmitting(false);
      console.log("Fin del procesamiento del pedido");
    }
  };

  const filteredProducts = searchTerm 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    },
    exit: { opacity: 0 }
  };

  // Función auxiliar para renderizar el icono según el nombre
  const renderIcon = (iconName) => {
    const IconComponent = iconComponents[iconName] || Code;
    return <IconComponent className="h-8 w-8 text-primary" />;
  };

  return (
    <div className="space-y-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.h1 
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="text-5xl font-extrabold mb-4 gradient-text"
        >
          Catálogo Digital
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
        >
          Explora nuestra diversa selección de productos digitales. Selecciona un artículo para iniciar tu pedido.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, width: "80%" }}
          animate={{ opacity: 1, width: "100%" }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative max-w-md mx-auto mb-10"
        >
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-6 bg-black/20 border-primary/30 focus:border-primary/60"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </motion.div>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            key={searchTerm} 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
          >
            {filteredProducts.length === 0 ? (
              <motion.div 
                className="col-span-full text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-xl text-muted-foreground">No se encontraron productos para tu búsqueda.</p>
              </motion.div>
            ) : (
              filteredProducts.map((product, index) => {
                const IconComponent = iconComponents[product.icon_name] || Code;
                
                return (
                  <motion.div
                    key={product.id}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    whileHover={{ scale: 1.05, y: -10 }}
                  >
                    <Card className="h-full flex flex-col glassmorphism overflow-hidden border-primary/30 hover:border-primary transition-all duration-300">
                      {product.image_url ? (
                        <div className="relative aspect-video bg-black/20 overflow-hidden">
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 p-2 bg-black/50 rounded-full">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                      ) : (
                        <CardHeader className="items-center text-center p-6 bg-black/30">
                          <motion.div 
                            className="p-3 bg-primary/20 rounded-full mb-3"
                            animate={{ rotate: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                          >
                            <IconComponent className="h-8 w-8 text-primary" />
                          </motion.div>
                          <CardTitle className="text-2xl font-semibold text-foreground">{product.name}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">{product.category}</CardDescription>
                        </CardHeader>
                      )}
                      
                      {product.image_url && (
                        <CardHeader className="pb-2">
                          <CardTitle className="text-2xl font-semibold text-foreground">{product.name}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">{product.category}</CardDescription>
                        </CardHeader>
                      )}
                      
                      <CardContent className="flex-grow p-6 flex flex-col">
                        <div className="text-muted-foreground text-sm leading-relaxed flex-grow mb-6">
                          {product.description.split('\n').map((line, i) => (
                            <p key={i} className="mb-1">{line}</p>
                          ))}
                        </div>
                        <motion.div 
                          className="flex items-center justify-center text-3xl font-bold text-primary mt-auto"
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 10 }}
                        >
                          <DollarSign className="h-7 w-7 mr-1" /> {product.price.toFixed(2)}
                        </motion.div>
                      </CardContent>
                      <CardFooter className="p-6 border-t border-border/40">
                        <motion.div className="w-full" whileTap={{ scale: 0.95 }}>
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-md py-3"
                            onClick={() => setSelectedProduct(product)}
                          >
                            <ShoppingBag className="mr-2 h-5 w-5" /> Comprar Ahora
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Modal de formulario de pedido */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={() => !isSubmitting && setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
              className="bg-background p-8 rounded-xl shadow-2xl w-full max-w-lg border border-primary/50 glassmorphism"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.h2 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold mb-2 text-primary"
              >
                Pedido: {selectedProduct.name}
              </motion.h2>
              <motion.p 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground mb-6"
              >
                Precio: ${selectedProduct.price.toFixed(2)}
              </motion.p>
              
              <form onSubmit={handleSubmitOrder} className="space-y-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Label htmlFor="discordUsername" className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                    <User className="h-4 w-4 mr-2 text-primary" /> Nombre de Usuario de Discord
                  </Label>
                  <Input 
                    type="text" 
                    id="discordUsername" 
                    name="discordUsername" 
                    value={formData.discordUsername} 
                    onChange={handleInputChange} 
                    placeholder="tu_usuario#1234" 
                    required 
                    disabled={isSubmitting}
                    className="bg-black/30 border-primary/30 focus:border-primary"
                  />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                    <Mail className="h-4 w-4 mr-2 text-primary" /> Correo Electrónico
                  </Label>
                  <Input 
                    type="email" 
                    id="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    placeholder="tu@email.com" 
                    required 
                    disabled={isSubmitting}
                    className="bg-black/30 border-primary/30 focus:border-primary"
                  />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Label htmlFor="message" className="text-sm font-medium text-muted-foreground flex items-center mb-1">
                    <MessageSquare className="h-4 w-4 mr-2 text-primary" /> Mensaje o Detalles Adicionales (Opcional)
                  </Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    value={formData.message} 
                    onChange={handleInputChange} 
                    rows={3} 
                    disabled={isSubmitting}
                    className="bg-black/30 border-primary/30 focus:border-primary" 
                    placeholder="Algún detalle o requisito especial..."
                  />
                </motion.div>

                <motion.div 
                  className="pt-2 flex items-center justify-between"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="border-primary/30 text-muted-foreground hover:bg-primary/10"
                    onClick={() => setSelectedProduct(null)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Procesando...
                        </>
                      ) : (
                        'Confirmar Pedido'
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de pedido exitoso */}
      <AnimatePresence>
        {successOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
              className="bg-background p-8 rounded-xl shadow-2xl w-full max-w-md border border-primary/50 glassmorphism"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-bold text-primary">¡Pedido Realizado!</h2>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => setSuccessOrder(null)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="space-y-6 mb-6">
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                  <p className="text-lg mb-2">Tu pedido <span className="font-bold text-primary">{successOrder.productName}</span> ha sido registrado.</p>
                  <div className="flex items-center justify-between bg-black/30 p-3 rounded-md">
                    <p className="font-mono text-lg text-primary font-bold">{successOrder.orderId}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => copyToClipboard(successOrder.orderId)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-center text-muted-foreground">Serás contactado en Discord para completar la compra.</p>
                  <p className="text-center text-sm text-muted-foreground">Asegúrate de guardar el ID de tu pedido.</p>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <Button 
                    className="bg-[#5865F2] hover:bg-[#4752c4] text-white"
                    onClick={() => window.open(discordInviteLink, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> Unirse a Discord
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => setSuccessOrder(null)}
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopPage;
  