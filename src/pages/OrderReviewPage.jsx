import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Trash2, RefreshCw, Filter, Search as SearchIconLucide, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { supabase, supabaseQuery } from '@/lib/supabaseClient';

// Datos iniciales para mostrar cuando no hay pedidos
const defaultOrders = [
  {
    id: 1,
    order_id: 'TEST0001',
    product_name: 'Software de Productividad X',
    price: 49.99,
    discord_username: 'usuario_test',
    email: 'test@ejemplo.com',
    status: 'Pendiente',
    message: 'Este es un pedido de prueba'
  }
];

const OrderReviewPage = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const { toast } = useToast();

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setConnectionError(false);
    console.log("Iniciando carga de pedidos...");
    
    try {
      // Utilizamos la función supabaseQuery para mejor manejo de errores
      const { data, error } = await supabaseQuery(() => 
        supabase.from('orders').select('*')
      );

      console.log("Respuesta de Supabase:", { data, error });

      if (error) {
        setConnectionError(true);
        throw error;
      }

      if (data && data.length > 0) {
        console.log("Datos encontrados:", data);
        setOrders(data);
        toast({
          title: "Pedidos cargados",
          description: `Se han cargado ${data.length} pedidos correctamente.`,
          duration: 3000,
        });
      } else {
        console.log("No se encontraron pedidos");
        setOrders([]);
        toast({
          title: "Sin pedidos",
          description: "No hay pedidos registrados en la base de datos.",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      setConnectionError(true);
      toast({
        variant: "destructive",
        title: "Error al cargar pedidos",
        description: `No se pudieron cargar los pedidos: ${error.message}`,
        duration: 5000,
      });
      // No mostramos datos por defecto automáticamente
      setOrders([]);
    } finally {
      setIsLoading(false);
      console.log("Carga de pedidos finalizada");
    }
  }, [toast]);

  useEffect(() => {
    console.log("Cargando pedidos al iniciar...");
    loadOrders();
  }, [loadOrders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Actualizar el estado del pedido en Supabase
      const { error } = await supabaseQuery(() => 
        supabase
          .from('orders')
          .update({ status: newStatus })
          .eq('order_id', orderId)
      );

      if (error) throw error;
      
      // Actualizar el estado localmente
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.order_id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
      toast({
        title: "Estado Actualizado",
        description: `El pedido ${orderId} ahora está ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      toast({
        variant: "destructive",
        title: "Error al actualizar estado",
        description: `No se pudo actualizar el estado: ${error.message}`,
      });
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      // Eliminar el pedido de Supabase
      const { error } = await supabaseQuery(() => 
        supabase
          .from('orders')
          .delete()
          .eq('order_id', orderId)
      );

      if (error) throw error;

      // Eliminar el pedido localmente
      setOrders(prevOrders => prevOrders.filter(order => order.order_id !== orderId));
      
      toast({
        title: "Pedido Eliminado",
        description: `El pedido ${orderId} ha sido eliminado.`,
      });
    } catch (error) {
      console.error('Error eliminando pedido:', error);
      toast({
        variant: "destructive",
        title: "Error al eliminar pedido",
        description: `No se pudo eliminar el pedido: ${error.message}`,
      });
    }
  };
  
  const getStatusBadgeVariant = (status) => {
    if (!status) return 'secondary';
    
    switch (status) {
      case 'Completado': return 'success';
      case 'Pendiente': return 'warning';
      case 'Cancelado': return 'destructive';
      default: return 'secondary';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = filter === 'Todos' || (order.status && order.status === filter);
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = 
      (order.order_id && order.order_id.toLowerCase().includes(lowerSearchTerm)) ||
      (order.product_name && order.product_name.toLowerCase().includes(lowerSearchTerm)) ||
      (order.discord_username && order.discord_username.toLowerCase().includes(lowerSearchTerm)) ||
      (order.email && order.email.toLowerCase().includes(lowerSearchTerm));
    return matchesFilter && matchesSearch;
  });

  const statusFilters = ['Todos', 'Pendiente', 'Completado', 'Cancelado'];

  console.log("Estado actual:", { isLoading, ordersCount: orders.length, filteredCount: filteredOrders.length });

  // Función para cargar datos de ejemplo
  const loadDefaultData = () => {
    setOrders(defaultOrders);
    toast({
      title: "Datos de ejemplo cargados",
      description: "Se han cargado datos de ejemplo para pruebas.",
    });
  };

  return (
    <div className="space-y-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-extrabold gradient-text">Revisión de Pedidos</h1>
          <p className="text-lg text-muted-foreground">Gestiona y actualiza el estado de los pedidos de los clientes.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={loadOrders} variant="outline" className="border-primary text-primary hover:bg-primary/10" disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> 
            {isLoading ? 'Cargando...' : 'Refrescar Pedidos'}
          </Button>
          {connectionError && (
            <Button onClick={loadDefaultData} variant="secondary" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Cargar datos de ejemplo</span>
            </Button>
          )}
        </div>
      </motion.div>

      <Card className="glassmorphism border-primary/30">
        <CardHeader className="border-b border-border/40 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
              <Filter className="h-5 w-5 text-primary flex-shrink-0" />
              {statusFilters.map(status => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className={`${filter === status ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent/10 hover:text-accent-foreground'} flex-shrink-0`}
                >
                  {status}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-auto">
              <SearchIconLucide className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text"
                placeholder="Buscar por ID, producto o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/20 border-primary/30 focus:border-primary/60 w-full sm:w-[300px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando pedidos...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-lg mb-2">No se encontraron pedidos</p>
              <p className="text-sm">
                {orders.length === 0 
                  ? "No hay pedidos registrados en la base de datos" 
                  : "Intenta cambiar los filtros o la búsqueda"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-black/20">
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead className="w-[250px]">Producto</TableHead>
                    <TableHead className="w-[180px]">Cliente</TableHead>
                    <TableHead className="w-[120px] text-right">Precio</TableHead>
                    <TableHead className="w-[120px]">Estado</TableHead>
                    <TableHead className="w-[220px] text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order, index) => (
                    <TableRow 
                      key={order.order_id || order.id || index}
                      className="border-b border-border/40 hover:bg-primary/5 transition-colors"
                    >
                      <TableCell className="font-medium">{order.order_id || "Sin ID"}</TableCell>
                      <TableCell>{order.product_name || "Sin nombre"}</TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          <div>{order.discord_username || "Sin usuario"}</div>
                          <div>{order.email || "Sin email"}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">${order.price?.toFixed(2) || "0.00"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)} className="flex items-center w-fit gap-1">
                          {order.status === 'Completado' && <CheckCircle className="h-3 w-3" />}
                          {order.status === 'Pendiente' && <Clock className="h-3 w-3" />}
                          {order.status === 'Cancelado' && <XCircle className="h-3 w-3" />}
                          {order.status || "Pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          {order.status !== 'Completado' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-600/50 text-green-500 hover:bg-green-900/20 hover:text-green-400"
                              onClick={() => updateOrderStatus(order.order_id, 'Completado')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" /> Completar
                            </Button>
                          )}
                          {order.status !== 'Pendiente' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-yellow-600/50 text-yellow-500 hover:bg-yellow-900/20 hover:text-yellow-400"
                              onClick={() => updateOrderStatus(order.order_id, 'Pendiente')}
                            >
                              <Clock className="h-4 w-4 mr-1" /> Pendiente
                            </Button>
                          )}
                          {order.status !== 'Cancelado' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-destructive/50 text-destructive hover:bg-destructive/20 hover:text-destructive"
                              onClick={() => updateOrderStatus(order.order_id, 'Cancelado')}
                            >
                              <XCircle className="h-4 w-4 mr-1" /> Cancelar
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => deleteOrder(order.order_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-border/40 p-4 text-center text-sm text-muted-foreground">
          Se {filteredOrders.length === 1 ? 'muestra' : 'muestran'} {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
          {filter !== 'Todos' && ` con estado "${filter}"`}
          {searchTerm && ` que coinciden con "${searchTerm}"`}
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderReviewPage;
  